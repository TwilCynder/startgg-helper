import {Query, SGGHelperClient} from "./dist/bundle.js"
import { testPaginated } from "./testPaginated.js";

let client = new SGGHelperClient("Bearer aa3c0cfb086c57be484694e743b788d03");

console.log(await testPaginated(client));