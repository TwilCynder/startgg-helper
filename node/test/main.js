import { makeClient } from "./common.js";
import { testLong } from "./long.js";
import { testShort } from "./short.js";
import { ArgumentsManager } from "@twilcynder/arguments-parser"

let {short, long, paginated, paginatedComplex, upsets} = new ArgumentsManager()
    .addSwitch(["-s", "--short"], {})
    .addSwitch(["-l", "--long"], {})
    .addSwitch(["-p", "--paginated"], {})
    .addSwitch(["-P", "--paginatedComplex"], {})
    .addSwitch(["-u", "--upsets"], {})
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