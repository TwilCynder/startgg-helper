//i am a god of JS

/**
 * Provides timing control for requests. If passed to a Query method, it will delay its execution to stay withing a defined limit.  
 * 
 * This is implemented like a semaphore automatically releasing tokens after a certain delay
 */
export class TimedQuerySemaphore {
    /**
     * @typedef {{client: any, schema: string, 
     *  params: {[varName: string]: value}, 
     *  resolve: (value: any) => void, 
     *  reject: (reason?: any) => void}
     * } Query
     */

    /**@type {Query[]} */
    #queue = [];    

    /**@type {NodeJS.Timeout[]} */
    #timers = [];

    /**@type {number} */
    #counter;

    /**@type {number}*/
    #delay;

    /**
     * 
     * @param {number} size Semaphore counter initial value : how many requests we can send before having to wait
     * @param {number} delay Delay before each taken token is released ;  how much time we wait before making new requests
     */
    constructor(size, delay){
        this.#counter = size;
        this.#delay = delay;
    }

    #startTimeout(){
        let t = setTimeout(() => {
            this.#release();
        }, this.#delay); 
        this.#timers.push(t);
    }

    /**
     * @param {any} client 
     * @param {string} schema 
     * @param {{[varName: string]: value}} params 
     * @returns 
     */
    #execute(client, schema, params){
        //console.log("Executing", params);

        this.#startTimeout();
        
        return client.request(schema, params);

        /*return new Promise((resolve) => setTimeout(() => {
            resolve(schema);
        }, 500))*/
    }

    /**
     * @param {Query} query 
     * @returns 
     */
    #executeQuery(query){
        return this.#execute(query.client, query.schema, query.params);
    }

    /**
     * Executes the given query with the given GraphQL Client. 
     * Note that this method probably shouldn't be called by anything else than Query.execute
     * @param {any} client 
     * @param {string} schema 
     * @param {{[varName: string]: value}} params 
     * @returns 
     */
    execute(client, schema, params){
        if (this.#counter > 0){
            this.#counter--;
            //console.log("A ticket was available !", params);
            return this.#execute(client, schema, params);
        } else {
            //console.log("No ticket vailable. Queueing.", params)
            return new Promise((resolve, reject) =>  this.#queue.push({client, schema, params, resolve, reject}));
        }
    }

    #release(){
        //console.error("Release");
        let query = this.#queue.shift();
        if (query){
            //console.error("A query was queued. Executing :", query.params);
            this.#executeQuery(query)
                .then(res => query.resolve(res))
                .catch(err => query.reject(err));
        } else {
            this.#counter++;
        }
    }

    /**
     * Stops the timing manager ; always call this at the end of your program, if you dont node will think there is still work to be done and won't exit
     */
    stop(){
        for (let timer of this.#timers){
            clearTimeout(timer);
        }
    }
}

/**TimedQuerySemaphore that allows one request before waiting. You should use the DelayQueryLimiter instead.*/
export class ClockQueryLimiter extends TimedQuerySemaphore {
    /** @param {number} rpm Requests per minute*/
    constructor(rpm){
        super(1, 60000 / rpm);
    }
}

/** ClockQueryLimiter configured to stay within the start.gg API requests limit (60 per minute, so 1 second delay). You should use the StartGGDelayQueryLimiter instead*/
export class StartGGClockQueryLimiter extends ClockQueryLimiter {
    constructor(){
        super(60);
    }
}

/**TimedQuerySemaphore that allows x requests before waiting, and waits for one minute. */
export class DelayQueryLimiter extends TimedQuerySemaphore {
    /** @param {number} rpm */
    constructor(rpm){
        super (rpm, 60000);
    }
}

/** ClockQueryLimiter configured to stay within the start.gg API requests limit (60 per minute)*/
export class StartGGDelayQueryLimiter extends DelayQueryLimiter {
    constructor(){
        super(60)
    }
}