import { deep_get, deep_set } from './jsUtil.js';
import { TimedQuerySemaphore } from './queryLimiter.js'

function isConnection(val){
    return val instanceof Object && val.nodes instanceof Array
}

/**
 * A GraphQL Document/Schema. Allows easily batch-requesting with the same schema but different parameters. 
 */
export class Query {
    #schema;
    #maxTries;

    /**
     * @param {string} schema The GraphQL [Schema] 
     * @param {number?} maxTries How many retries will be performed when requesting using this query
     */
    constructor (schema, maxTries = null){
        this.#schema = schema;
        this.#maxTries = maxTries;
    }

    /**
     * 
     * @param {string} logName 
     * @param {{[varName: string]: value}} params 
     * @returns 
     */
    #getLog(logName, params){
        if (!this.log) return null;
        let log = this.log[logName];
        if (log){
            if (typeof log == "string"){
                return log;
            } else if (typeof log == "function"){
                return log(params);
            }
        }
        return null;
    }

    /**
     * 
     * @param {GraphQLClient} client 
     * @param {{[varName: string]: value}} params 
     * @param {number} tries How many tries in are we 
     * @param {TimedQuerySemaphore} limiter 
     * @param {boolean} silentErrors legacy parameter, does nothing
     * @param {number} maxTries Overrides this.#maxTries
     */
    async #execute_(client, params, tries, limiter = null, silentErrors = false, maxTries = null){
        maxTries = maxTries || this.#maxTries || 1

        console.log((this.#getLog("query", params) || "Querying ...") + " Try " + (tries + 1));
        try {
            let data = await ( limiter ? limiter.execute(client, this.#schema, params) : client.request(this.#schema, params));
            
            return data;
        } catch (e) {
            
            if (tries >= maxTries) {
                console.error("Maximum number of tries reached. Throwing.", e);
                throw e;
            }
            console.error((this.#getLog("error", params) || "Request failed.") + ` Retrying (try ${tries + 1}). Error : `, e);
            return this.#execute_(client, params, tries + 1, limiter, silentErrors, maxTries);
        }
    }

    /**
     * @param {GraphQLClient} client A client object ; not provided by this package, either use startgg-helper-node (or-browser) or refer to README.md
     * @param {{[varName: string]: value}} params GraphQL variables
     * @param {TimedQuerySemaphore} limiter A request limiter object; see TimedQuerySemaphore
     * @param {boolean} silentErrors No effect, exists only for legacy purposes
     * @param {number} maxTries Overrides the default maximum tries count for this query.
     * @returns 
     */
    async execute(client, params, limiter = null, silentErrors = false, maxTries = null){
        return await this.#execute_(client, params, 0, limiter, silentErrors, maxTries);
    }

    static IWQModes = {
        DONT: 0,
        INLINE: 1,
        DUPLICATE: 2,
        OUT: 3
    }

    /**
     * Queries a whole paginated collection (of a *Connection type). See the start.gg API doc or this package's documentation for more info about pagniated collections. This is done through executing the query repeatedly while increasing the page index each time. 
     * The target collection must be pointed to by the "path" argument, and will be agregated in a single array. The schema must have a variable (whose name can be specified in parameters) that is used as the page index of the paginated field.
     * 
     * 
     * @param {GraphQLClient} client A client object ; not provided by this package, either use startgg-helper-node (or-browser) or refer to README.md
     * @param {{[varName: string]: value}} params GraphQL variables ; does not include the page index variable. 
     * @param {string} connectionPathInQuery JSON path to the paginated collection that must be aggregated in the query (JSON path : property names separated by dots, see deep_get())
     * @param {TimedQuerySemaphore} limiter A request limiter object; see TimedQuerySemaphore
     * @param {{pageParamName?: string, perPageParamName?: string, perPage?: number, delay?: number, maxElements?: number, includeWholeQuery?: number, callback: (localResult: T[]) => T[]?}} config 
     * @param  config.pageParamName name of the variable representing the page index. This variable must exist in your query, and be used as an argument in a paginated collection field
     * @param  config.delay number of miliseconds to wait for between each query. No delay if absent.
     * @param  config.maxElements if present, queries will stop once this many elements have been fetched
     * @param  config.includeWholeQuery controls the structure of the result. If 0, only an array is returned, if 1 the whole query is returned with the `nodes` field replaced with the full array, if 3 this functions returns a tuple containing the aggregated collection and the rest of the query, 2 does both 1 and 3. 
     * @param config.callback a callback function called for each fetched page, with the page elements and the page index. It should return an array itself, which will be treated as the actual page (allowing users to transform the pages on the fly) ; if it does not, the paginated execution is stopped.
     * @param {boolean} silentErrors No effect, exists only for legacy purposes
     * @param {number} maxTries 
     * @returns See config.includeWholeQuery
     */
    async executePaginated(client, params, connectionPathInQuery, limiter = null, config = {}, silentErrors = false, maxTries = null){
        let result = [];
        //delay = null, perPage = undefined, pageParamName = "page", perPageParamName = "perPage", silentErrors = false, maxTries = null
        const pageParamName = config.pageParamName ?? "page";
        const perPageParamName = config.perPageParamName ?? "perPage";
        const perPage = config.perPage ?? params[perPageParamName];
        const delay = config.delay;
        const maxElements = config.maxElements ?? undefined; //eliminating null

        let currentPage = 1;

        params = Object.assign({}, params);
        params[pageParamName] = currentPage;
        params[perPageParamName] = perPage;

        let data;
        while (true){
            if (result.length >= maxElements) break;

            console.log("Querying page", params[pageParamName], `(${result.length} elements loaded)`);
            data = await this.execute(client, params, limiter, silentErrors, maxTries);

            if (!data) throw (this.#getLog("error", params) ?? "Request failed.") + "(in paginated execution, at page " + params[pageParamName] + ")";

            let connection = deep_get(data, connectionPathInQuery);

            if (!connection) {
                console.warn(`The given path ${connectionPathInQuery} does not point to anything.`);
                return null;
            }

            if (!isConnection(connection)) throw "The given path does not point to a connection type";

            let localResult = connection.nodes;

            if (connection.pageInfo && connection.pageInfo.totalPages){
                let totalPages = connection.pageInfo.totalPages;
                if (!totalPages || currentPage >= totalPages) {
                    if (config.callback){
                        let cbRes = config.callback(localResult, currentPage);
                        if (!cbRes) break;
                        localResult = cbRes;
                    }
                    result = result.concat(localResult);
                    break;
                }
            } else {
                if (localResult.length < 1) break;
            }

            if (config.callback){
                let cbRes = config.callback(localResult, currentPage);
                if (!cbRes) break;
                localResult = cbRes;
            }

            result = result.concat(localResult);
            currentPage++;
            params[pageParamName] = currentPage;

            if (delay)
                await new Promise(r => setTimeout(r, delay));
        }

        if (maxElements) result = result.slice(0, maxElements);

        if (config.includeWholeQuery == Query.IWQModes.DUPLICATE || config.includeWholeQuery == Query.IWQModes.INLINE){
            deep_set(data, connectionPathInQuery + ".nodes", result);
        } else if (config.includeWholeQuery == Query.IWQModes.OUT){
            deep_set(data, connectionPathInQuery + ".nodes", null);
        }

        if (config.includeWholeQuery == Query.IWQModes.DUPLICATE || config.includeWholeQuery == Query.IWQModes.OUT){
            return [result, data]
        } else if (config.includeWholeQuery == Query.IWQModes.INLINE){
            return data;
        }

        return result;
    }

    /**
     * Deprecated, use executePaginated instead.
     * 
     * Executes a query containing a paginated collection, repeatedly, increasing the page index each time until nothing is returned, returning an aggregation of all the pages.
     * @param {GraphQLClient} client 
     * @param {{[varName: string]: value}} params 
     * @param {string} collectionPathInQuery JSON path to the paginated collection that must aggregated in the query (JSON path : property names separated by dots)
     * @param {TimedQuerySemaphore} limiter 
     * @param {{pageParamName?: string, perPageParamName?: string, perPage?: number, delay?: number, maxElements?: number, includeWholeQuery?: number}} config 
     * @param {boolean} silentErrors 
     * @param {number} maxTries 
     * @returns 
     */
    async executePaginatedLegacy(client, params, collectionPathInQuery, limiter = null, config = {}, silentErrors = false, maxTries = null){
        let result = [];
        //delay = null, perPage = undefined, pageParamName = "page", perPageParamName = "perPage", silentErrors = false, maxTries = null
        const pageParamName = config.pageParamName ?? "page";
        const perPageParamName = config.perPageParamName ?? "perPage";
        const perPage = config.perPage ?? params[perPageParamName];
        const delay = config.delay;
        const maxElements = config.maxElements ?? undefined; //eliminating null

        params = Object.assign({}, params);
        params[pageParamName] = 1;
        params[perPageParamName] = perPage;

        let data;
        while (true){
            if (result.length >= maxElements) break;

            console.log("Querying page", params[pageParamName], `(${result.length} elements loaded)`);
            data = await this.execute(client, params, limiter, silentErrors, maxTries);

            if (!data) throw (this.#getLog("error", params) ?? "Request failed.") + "(in paginated execution, at page " + params[pageParamName] + ")";

            let localResult = deep_get(data, collectionPathInQuery);

            if (!localResult) {
                console.warn(`The given path ${collectionPathInQuery} does not point to anything.`);
                return null;
            }
            
            if (!localResult.push) throw "The given path does not point to an array."

            if (localResult.length < 1) break;

            result = result.concat(localResult);
            params[pageParamName]++;

            if (delay)
                await new Promise(r => setTimeout(r, delay));
        }

        if (maxElements) result = result.slice(0, maxElements);

        if (config.includeWholeQuery == Query.IWQModes.DUPLICATE || config.includeWholeQuery == Query.IWQModes.INLINE){
            deep_set(data, collectionPathInQuery, result);
        } else if (config.includeWholeQuery == Query.IWQModes.OUT){
            deep_set(data, collectionPathInQuery, null);
        }

        if (config.includeWholeQuery == Query.IWQModes.DUPLICATE || config.includeWholeQuery == Query.IWQModes.OUT){
            return [result, data]
        } else if (config.includeWholeQuery == Query.IWQModes.INLINE){
            return data;
        }

        return result;
    }
}