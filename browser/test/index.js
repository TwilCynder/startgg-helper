import {Query, SGGHelperClient} from "./dist/bundle.js"
import { testPaginated } from "./testPaginated.js";

let client = new SGGHelperClient("abcd");

try {
    await testPaginated(client)
} catch (err){
    console.log("ALLO")
    console.log(err.resBody);
}
