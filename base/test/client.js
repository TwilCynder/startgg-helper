import fs from "fs/promises"
import {createClient} from "../../node/client.js"

export async function createClientAuto(){
    let token = process.env.TOKEN;
    if (!token){
        try {
            const secrets = await fs.readFile(import.meta.dirname + "/settings.json").then(buf => JSON.parse(buf.toString()));
            console.log(secrets)
            if (secrets){
                if (secrets.token){
                    return createClient(secrets.token);
                } else {
                    console.warn("Secrets file found, but no token property. Using token-less client.")
                }
            }

        } catch (err) {
            if (err.code != "ENOENT"){
                console.warn("Error while reading secrets file ; using token-less client. Error :");
                console.warn(err);
            } else {
                console.warn("No secrets file found, using token-less client");
            }
        }
        return createClient();
    }
}