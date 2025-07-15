import {Query, RateLimitingSGGHelperClient} from "./dist/bundle.js"
import { runTests } from "./testScripts/runTests.js";


let token;
try {
    token = await fetch("./settings.json").then(buf => buf.json()).then(res => {
        if (!res) throw "File doesn't contain config";
        if (!res.token) throw "Token not found in config";
        return res.token;
    })
} catch (err){
    console.error("Could not load settings from settings.json. Reason :", err);
}

console.log("Token :", token)

if (token){
    let client = new RateLimitingSGGHelperClient(token);

    try {
        await runTests(client);
    } catch (err){
        console.error("ERROR")
        console.error(err);
    }

}
