import { makeClient } from "./common.js";
import { testShort } from "./short.js";

let client = makeClient();

console.log(await testShort(client));