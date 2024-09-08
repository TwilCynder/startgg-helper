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

async function requestStartGG(schema, variables, token){
    const response = await fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': token
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
    if (!json.success){
        throw new Error("GraphQL Error (code" + response.status + ")" + {response, request: {
            schema, variables
        }})
    }
    return json.data;
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