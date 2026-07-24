import {RateLimitingSGGHelperClient, StartGGDelayQueryLimiter} from "./dist/bundle.js"
import { runAll, runSingleTest } from "./src/runTests.js";

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
    let client = new RateLimitingSGGHelperClient("Bearer " + token);
    let limiter = new StartGGDelayQueryLimiter();

    try {
        const searchParams = new URLSearchParams(window.location.search)
        let testName = searchParams.get("test");
        
        await testName ?
            runSingleTest(testName, client, limiter) :
            runAll(testName, limiter);

        // await runAll(client, limiter);
    } catch (err){
        console.error(err); 
    }

}
