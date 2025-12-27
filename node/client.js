import { GraphQLClient } from 'graphql-request';

const publicEndpoint = 'https://api.start.gg/gql/alpha';
const secretEndpoint = 'https://www.start.gg/api/-/gql';

const secretEndpointHeaders = {
    "client-version": "21",
    'Content-Type': 'application/json'
}

/**
 * @param {string?} token
 */
export function createClient(token){
    return token ? 
        new GraphQLClient(publicEndpoint, {headers: {
            Authorization: token.startsWith("Bearer ") ? token : ("Bearer " + token)
        }}) :
        new GraphQLClient(secretEndpoint, {
        headers: secretEndpointHeaders
    });
}