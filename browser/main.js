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
        super("Received code " + response.status + " | " + JSON.stringify(request));
        this.name = "GraphQLError"
        this.response = response;
        this.resBody = resBody;
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
    if (json.success === false){
        throw new GraphQLError(response, {schema, variables}, json);
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