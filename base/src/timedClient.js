import { TimedSemaphore } from "./queryLimiter";

class TimedClient {
    
    /** The underlying client */
    #client;
    /** Optional limiter @type {TimedSemaphore?} */
    #limiter;

    /**
     * 
     * @param {GraphQLClient} client Underlying client used to send requests
     * @param {number} rpm How many requests per minute to allow ; start.gg maximum is 80, **default is 60** to leave margin in case of network timing mishaps
     */
    constructor(client, rpm = 60){
        this.#client = client;
        this.#limiter = new TimedSemaphore(rpm, 60000);
    }

    async request(schema, variables){

    }
}