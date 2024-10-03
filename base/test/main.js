import { deep_get } from "../src/jsUtil.js";
import { makeClient } from "./common.js";
import { testLong } from "./long.js";
import { testPaginated } from "./paginated.js";
import { testPaginatedComplex } from "./paginatedComplex.js";
import { testShort } from "./short.js";
import { ArgumentsManager } from "@twilcynder/arguments-parser"

let {short, long, paginated, paginatedComplex} = new ArgumentsManager()
    .addSwitch(["-s", "--short"], {})
    .addSwitch(["-l", "--long"], {})
    .addSwitch(["-p", "--paginated"], {})
    .addSwitch(["-P", "--paginatedComplex"], {})
    .enableHelpParameter()
    .parseProcessArguments()

let client = makeClient();

if (short){
    console.log("Testing : single query");
    console.log(await testShort(client)); 
}

if (long){
    console.log("Testing : 100ish queries, with delay-based limiter");
    console.log(await testLong(client)); 
}

if (paginated){
    console.log("Testing : paginated query");
    console.log(await testPaginated(client)); 
}

if (paginatedComplex){
    console.log("Testing : paginated query");
    let res = await testPaginatedComplex(client);
    console.log(res, deep_get(res, "event.sets.nodes.length")); 
}