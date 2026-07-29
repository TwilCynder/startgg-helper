export class StartGGAPIError extends Error {
    #cause;
    #query;
    
    /**
     * @param {Error} err 
     * @param {Query} query 
     */
    constructor(err, query){
        super(err.message);

        this.#query = query;
        this.variables = err.request.variables;
        this.#cause = err;
    } 

    getQuery(){
        return this.#query;
    }

    getVeriables(){
        return this.variables;
    }

    getSchema(){
        return this.#cause.request.query;
    }

    getResponse(){
        return this.#cause.response;
    }
}