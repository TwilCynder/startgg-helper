import { Query } from "../../src/query.js";
import { basicSchema } from "./commonRequests.js";

let query = new Query(basicSchema, 0);
export default async function testBadRequest(client, limiter){
    let error = null;
    try {
        await query.execute(client, {slug: "+not+a/slug/"}, limiter);
    } catch (err){
        error = err;
    }
    return error;
}