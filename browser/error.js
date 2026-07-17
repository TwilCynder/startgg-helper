function errorIdText(id){
    return id ? ` (error id ${id})` : "";
}

function messageFromResBody(body){
    return body.message + errorIdText(body.errorId);
}

export class GraphQLError extends Error {
    /**
     * @param {Response} response 
     * @param {{schema: {}, variables: {}}} request 
     */
    constructor(response, request){
        const resBody = response.body ?? {};
        let message = "";

        if (resBody.message){
            message = messageFromResBody(resBody);
        } else if (resBody.errors){
            if (resBody.errors.length == 1){
                message = messageFromResBody(resBody.errors[0]);
            } else {
                for (let error of resBody.errors){
                    message += "- " + error.message + ` (error id ${error.errorId})\n`;
                }
            }
        }
        super(
            "Received code " + response.status + " \n " + message 
        )

        //super("Received code " + response.status + " ; " + JSON.stringify(request));
        this.name = "GraphQLError"
        this.response = response;
        this.request = request;
    }
}