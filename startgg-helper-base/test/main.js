import { makeClient } from "./common.js";
import { testShort } from "./short.js";

let client = makeClient();

await testShort(client);