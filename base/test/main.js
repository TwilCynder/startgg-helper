import { deep_get } from "../src/jsUtil.js";
import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { createClientAuto } from "./client.js";
import { StartGGDelayQueryLimiter } from "../src/queryLimiter.js";
import { inspect } from "util"

//-------- Configuring tests

function log(val){
    return inspect(val, {colors: true, showHidden: false, depth: null, breakLength: Infinity, compact: true})
}

const defaultUser = (res) => console.log(res);
const withExpectedUser = ([res, expected]) => console.log(res, expected);
const tc = (path, shortSwitch, dest, name, userFunction = defaultUser) => ({path, shortSwitch, dest, name, userFunction});
const testsConfig = [
    tc("./testScripts/short.js", "s", "short", "single query"),
    tc("./testScripts/long.js", "l", "long", "100ish queries"),
    tc("./testScripts/paginated.js", "p", "paginated", "paginated query"),
    tc("./testScripts/paginatedComplex.js", "P", "paginated-complex", "complex paginated query", res => console.log(deep_get(res, "event.sets.nodes"))), 
    tc("./testScripts/startggError.js", "e", "error", "API error translation"),
    tc("./testScripts/upsets.js", "u", "upsets", "upsets calculation", withExpectedUser),
    tc("./testScripts/deep_get.js", "d", "deep-functions", "deep get/set functions", (results) => results.map(([res, expected]) => console.log(log(res), "|", log(expected)))),
    tc("./testScripts/placementSuffix.js", "S", "placement-suffix", "placement suffixes", ([res, expected]) => {
        console.log(res.join("\t"));
        console.log(expected.join("\t"));
    })
];

//-------- CLI (config + parse)

const argumentsManager = new ArgumentsManager()
for (const test of testsConfig){
    argumentsManager.addSwitch(["-" + test.shortSwitch, "--" + test.dest], {dest: test.dest});
}
argumentsManager.enableHelpParameter();

const args = argumentsManager.parseProcessArguments();

//-------- Loading tests
/** @type {[ReturnType<tc>, (client, limiter) => Promise<any>][]} */
const tests = await Promise.all(testsConfig
    .filter(test => args[test.dest])
    .map(async test => [test, await import(test.path).then(module => module.default)]
));

//-------- Running tests

const client = await createClientAuto();
const limiter = new StartGGDelayQueryLimiter();

for (const [test, testFunction] of tests){
    console.log("Testing :", test.name);
    const res = await testFunction(client, limiter);
    test.userFunction(res);
}

limiter.stop();

/*
import { deep_get } from "../src/jsUtil.js";
import { createClientAuto } from "./client.js";
import { testLong } from "./testScripts/long.js";
import { testPaginated } from "./testScripts/paginated.js";
import { testPaginatedComplex } from "./testScripts/paginatedComplex.js";
import { testShort } from "./testScripts/short.js";
import { ArgumentsManager } from "@twilcynder/arguments-parser"
import { testUpsets } from "./testScripts/upsets.js";
import { testPlacementSuffix } from "./testScripts/placementSuffix.js";
import { testBadRequest } from "./testScripts/startggError.js";
import { StartGGDelayQueryLimiter } from "../src/queryLimiter.js";

let {short, long, paginated, paginated_complex, upsets, placement_suffix, error} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addSwitch(["-s", "--short"], {})
    .addSwitch(["-l", "--long"], {})
    .addSwitch(["-p", "--paginated"], {})
    .addSwitch(["-P", "--paginated-complex"], {})
    .addSwitch(["-e", "--error"], {})
    .addSwitch(["-u", "--upsets"], {})
    .addSwitch(["-S", "--placement-suffix"], {})
    .enableHelpParameter()
    .parseProcessArguments()

let client = await createClientAuto();
let limiter = await StartGGDelayQueryLimiter();

if (short){
    console.log("Testing : single query");
    console.log(await testShort(client, limiter)); 
}

if (long){
    console.log("Testing : 100ish queries");
    console.log(await testLong(client, limiter)); 
}

if (paginated){
    console.log("Testing : paginated query");
    console.log(await testPaginated(client, limiter)); 
}

if (paginated_complex){
    console.log("Testing : paginated query");
    let res = await testPaginatedComplex(client, limiter);
    console.log(res, deep_get(res, "event.sets.nodes")); 
}

if (upsets){
    console.log("Testing : upsets calculation");
    let [res, expected] = await testUpsets(client, limiter);
    console.log(res);
    console.log(expected);
}

if (placement_suffix){
    console.log("Testing : placement suffixes");
    let [res, expected] = testPlacementSuffix();
    console.log(res.join("\t"));
    console.log(expected.join("\t"));
}

if (error){
    console.log("Testing : API error translation");
    let error = await testBadRequest(client, limiter);
    console.log(error);
}

limiter.stop();
*/