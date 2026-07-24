/**
 * @typedef {typeof import("./testScripts/short.js").default} Test
 */

import { loadAll, loadScript } from "./loadScripts.js";

function log(id, result, color){
    let line = document.querySelector("#"+id);

    line.querySelector(".result").innerHTML = result;
    line.classList.add(color)    
}

function logFailure(id, test, error){
    console.error("Test", test.name, "failed :", error);
    log(id, "Failure : " + error.message, "red");
}

function logSuccess(id, test){
    console.log("Test", test.name, "succeeded !");
    log(id, "Success !", "green");
}

/**
 * @param {Test} test 
 * @param {string} id 
 * @returns 
 */
function testLogDiv(test, id){
    return `<tr class="test-log" id="${id}"><td class="test-name">${test.name}</td><td class="result">Pending ...</td></tr>`
}

/**
 * 
 * @param {Test} test 
 */
async function runTest(test, id, client, limiter){
    console.log("Running test", test.name)
    let res;
    try {
        let val = await test.runTest(client, limiter);

        let err = test.validate(val); //falsy means success
        if (err) {
            logFailure(id, test, err);
            res = {name: test.name, success: false, reason: err};
        } else {
            logSuccess(id, test);
            res = {name: test.name, success: true};
        }
    } catch (err){
        logFailure(id, test, err);
        res = {test: test.name, success: false, reason: err};
    }
    return res;
}

export async function runSingleTest(name, client, limiter){
    const test = await loadScript(name);
    document.getElementById("content").innerHTML = testLogDiv(test, name);
    const res = await runTest(test, name, client, limiter);
    console.log("Result :", res);
}

export async function runAll(client, limiter){
    const tests = await loadAll();

    for (const [name, test] of tests){
        document.getElementById("content").innerHTML = tests.map(([name, test]) => testLogDiv(test, name)).join("");
    }

    let results = []
    for (const [name, test] of tests){
        let res = await runTest(test, name, client, limiter);
        results.push(res);
    }

    console.log("Final results :", results);
}

