import { deep_get, StartGGDelayQueryLimiter } from "../dist/bundle.js";
import { testUpsets, validateUpsets } from "./upsets.js"
import { testLong } from "./long.js";
import { testPaginated } from "./paginated.js";
import { testPaginatedComplex } from "./paginatedComplex.js";
import { testShort } from "./short.js";

function logFailure(name, error){
    console.error("Test", name, "failed :");
    console.error(error);

    document.getElementById("log").innerHTML += '<span class = "red">Test ' + name + " has failed. Reason : " + error + '</span><br>'
}

function logSuccess(name){
    console.log("Test", name, "succeeded !");

    document.getElementById("log").innerHTML += '<span class = "green">Test ' + name + " Succeeded ! </span><br>"
}

let results = [];
async function runTest(name, f, validationFunction){
    let res;
    try {
        let val = await f()

        let err = validationFunction(val, name); //falsy means success
        if (res) {
            logFailure(name, err);
            res = {name, success: false, reason: err};
        } else {
            logSuccess(name);
            res = {name, success: true};
        }
    } catch (err){
        logFailure(name, err);
        res = {name, success: false, reason: err};
    }
    results.push(res);
}

function truthyValidator(path){
    return (val) => {
        if (path) val = deep_get(path);
        return (val ? false : ("Expected " + (path ?? "result") + " to be true, got" + val))
    }
}

function equalValidator(equals, path){
    return (val) => {
        if (path) val = deep_get(val, path);
        return (val === equals ? false : ("Expected " + (path ?? "result") + " to be " + equals + ", got " + val))
    }
}

export async function runTests(client){
    let limiter = new StartGGDelayQueryLimiter();
    await runTest("Single query (event results)", async () => testShort(client, limiter), truthyValidator());
    await runTest("100ish queries", async () => testLong(client, limiter), truthyValidator());
    await runTest("Paginated query (sets)", async () => testPaginated(client, limiter), truthyValidator())
    await runTest("Paginated query (sets) with advanced options", async () => testPaginatedComplex(client, limiter), equalValidator(100, "event.sets.nodes.length"));
    await runTest("Calculate upset factor on 8 sets across 2 events", async () => testUpsets(client, limiter), validateUpsets);

    console.log("Final results :", results);
}

