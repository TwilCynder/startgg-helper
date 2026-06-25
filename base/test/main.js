import { deep_get } from "../src/jsUtil.js";
import { makeClient } from "./common.js";
import { testLong } from "./long.js";
import { testPaginated } from "./paginated.js";
import { testPaginatedComplex } from "./paginatedComplex.js";
import { testShort } from "./short.js";
import { ArgumentsManager } from "@twilcynder/arguments-parser"
import { testUpsets } from "./upsets.js";
import { testPlacementSuffix } from "./tournamentUtil.js";

let {short, long, paginated, paginated_complex, upsets, placement_suffix} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addSwitch(["-s", "--short"], {})
    .addSwitch(["-l", "--long"], {})
    .addSwitch(["-p", "--paginated"], {})
    .addSwitch(["-P", "--paginated-complex"], {})
    .addSwitch(["-u", "--upsets"], {})
    .addSwitch(["-S", "--placement-suffix"], {})
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

if (paginated_complex){
    console.log("Testing : paginated query");
    let res = await testPaginatedComplex(client);
    console.log(res, deep_get(res, "event.sets.nodes")); 
}

if (upsets){
    console.log("Testing : upsets calculation");
    let [res, expected] = await testUpsets(client);
    console.log(res);
    console.log(expected);
}

if (placement_suffix){
    console.log("Testing : placement suffixes");
    let [res, expected] = testPlacementSuffix();
    console.log(res.join("\t"));
    console.log(expected.join("\t"));
}