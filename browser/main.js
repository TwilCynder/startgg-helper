import { Query } from "startgg-helper";
export * from "startgg-helper"

export async function loadQuery(url, maxTries = null){
    try {
        let schema = await fetch(url)
            .then(res => res.text())
        return new Query(schema, maxTries);
    } catch (err){
        throw new Error("Failed to load query from GraphQL file. Reason : " + err);
    }
}

class GraphQLError extends Error {
    /**
     * 
     * @param {Response} response 
     * @param {{schema: {}, variables: {}}} request 
     */
    constructor(response, request, resBody){
        let message = "";
        if (resBody.message){
            message = resBody.message + ` (error id ${resBody.errorId})\n`;
        } else if (resBody.errors){
            message = "Errors : \n";
            for (let error of resBody.errors){
                message += "- " + error.message + ` (error id ${error.errorId})\n`;
            }
            message += '\n';
        }
        super(
            "Received code " + response.status + " \n " + 
            message + 
            "Original request : " + JSON.stringify(request)
        )

        //super("Received code " + response.status + " ; " + JSON.stringify(request));
        this.name = "GraphQLError"
        this.response = response;
        this.resBody = resBody;
    }
}

export class SGGHelperClient {
    #token;

    /**
     * 
     * @param {string} token 
     */
    constructor(token){
        this.#token = token;
    }

    async request(schema, variables){
        const response = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': this.#token
            },
            body: JSON.stringify({
                'query': schema,
                'variables': variables
            }),
        });
        const json = await response.json();
        if (!json){
            throw "Empty response"
        }
        if (!json.data){
            throw new GraphQLError(response, {schema, variables}, json);
        }
    
        return json.data;
    }
}

export class RateLimitingSGGHelperClient extends SGGHelperClient {
    #pauseTimer;
    #pausePromise;
    #pauseDelay = 60000;
    //bool paused = !!pauseTimer;

    isPaused(){
        return !!this.#pausePromise;
    }

    pause(){
        if (this.isPaused()){
            clearTimeout(this.#pauseTimer);
        } else {
            let resolve, reject;
            let promise = new Promise((resolve_, reject_) => {
                resolve = resolve_;
                reject = reject_;
            })
            this.#pausePromise = {promise, resolve, reject};
        }
        this.#pauseTimer = setTimeout(() => {
            this.#unpause();
        }, this.#pauseDelay);
    }

    #unpause(){
        if (this.isPaused()){
            this.#pausePromise.resolve();
            this.#pauseTimer = undefined;
        }
    }

    async request(schema, variables){
        console.log(this.#pausePromise);
        if (this.isPaused()) await this.#pausePromise;
        
        try {
            return await super.request(schema, variables);
        } catch (err){
            if (err instanceof GraphQLError){
                if (err.response.status == 429){
                    //IT WAS A RATE LIMIT ERROR
                    console.warn("Rate limit exceeded. Pausing this client for 60 seconds. The caller should initiate a retry.")
                    this.pause();
                }
            }
            throw err;
        }
    }

    stop(){
        clearTimeout(this.#pauseTimer);
    }
}