import { PageResult, Query } from "../src/query.js";
import { schema } from "./paginatedCommon.js";

let query = new Query(schema, 3);

query.paginatedLog = (params) => {
    const tournamentSlug = params.slug.split("/")[1];
    return {
        query: (params) => "Fetching sets for event 1v1-ultimate of tournament " + tournamentSlug + ", page " + params.page
    }
}

export async function testPaginatedComplex(client){

    let result = await query.executePaginated(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, "event.sets", null, {
        perPage: 10,
        includeWholeQuery: Query.IWQModes.INLINE,
        maxElements: 100, 
        callback: (localresult, currentResult, i) => {
            console.log(localresult, i);
        }
    });
    return result;
}