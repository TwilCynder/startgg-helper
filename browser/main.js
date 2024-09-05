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

function requestStartGG(schema, variables, token){
    return fetch('https://api.start.gg/gql/alpha', {         
        method: 'POST',         
        headers: {             
            'Content-Type': 'application/json',             
            'accept' : 'application/json',             
            'Authorization' : token         
        },
        body: JSON.stringify({
            'query': schema,
            'variables' : variables
        }),  
        
    })     
    .then((response) => response.json()) 
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

    request(schema, variables){
        return requestStartGG(schema, variables, this.#token);
    }
}