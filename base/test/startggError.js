import { Query } from "../src/query.js";
import { basicSchema } from "./commonRequests.js";

let query = new Query(basicSchema, 0);
export async function testBadRequest(client){
    let error = null;
    try {
        await query.execute(client, {slug: "+not+a/slug/"});
    } catch (err){
        error = err;
    }
    return error;
}