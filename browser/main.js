import { Query } from "startgg-helper";
import { GraphQLError } from "./error";
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
        const reqBody = {
            'query': schema,
            'variables': variables
        };

        const response = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': this.#token
            },
            body: JSON.stringify(reqBody),
        });

        const json = await response.json();
        if (!json){
            throw "Empty response"
        }
        if (!json.data){
            throw new GraphQLError(response, json, reqBody);
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