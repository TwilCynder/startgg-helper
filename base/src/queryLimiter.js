//i am a god of JS

/**
 * Provides timing control for requests. If passed to a Query method, it will delay its execution to stay withing a defined limit.  
 * 
 * This is implemented like a semaphore automatically releasing tokens after a certain delay
 */
export class TimedSemaphore {
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
     * Executes the given query with the given GraphQL Client. 
     * Note that this method probably shouldn't be called by anything else than Query.execute
     * @param {any} client 
     * @param {string} schema 
     * @param {{[varName: string]: value}} params 
     * @returns 
     */
    lock(){
        if (this.#counter > 0){
            this.#counter--;
            //console.log("A ticket was available !", params);
            this.#startTimeout();
            return;
        } else {
            //console.log("No ticket vailable. Queueing.", params)
            return new Promise((resolve, reject) =>  this.#queue.push(resolve));
        }
    }

    #release(){
        //console.error("Release");
        let resFunc = this.#queue.shift();
        if (resFunc){
            resFunc();
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