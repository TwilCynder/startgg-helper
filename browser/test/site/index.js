import {RateLimitingSGGHelperClient, StartGGDelayQueryLimiter} from "./src/dist/bundle.js"
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

function displayMessage(msg){
    document.getElementById("message").innerHTML += msg;
}

console.log("Token :", token)

if (token){
    let client = new RateLimitingSGGHelperClient(token);
    let limiter = new StartGGDelayQueryLimiter();
    console.log(client)
    const searchParams = new URLSearchParams(window.location.search)
    let testName = searchParams.get("test");
        
    try {
        if (testName){
            displayMessage(`Running test "${testName}" : `);
            await runSingleTest(testName, client, limiter);
        } else {
            displayMessage("Running all tests : ");
            await runAll(client, limiter);
        }
    } catch (err){
        displayMessage(`<span class="red">Error : ${err.message}</span`)
    }


    // await runAll(client, limiter);


}
