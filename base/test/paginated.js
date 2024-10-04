import { Query } from "../src/query.js";

import { schema } from "./paginatedCommon.js";

let query = new Query(schema, 3);
export async function testPaginated(client){
    let result = await query.executePaginated(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, "event.sets");
    return result;
}