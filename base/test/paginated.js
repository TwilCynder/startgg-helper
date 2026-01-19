import { Query } from "../src/query.js";

import { schema } from "./paginatedCommon.js";

let query = new Query(schema, 3);
query.log = {
    query: (params) => "Fetching sets for event " + params.slug + ", page " + params.page
}

export async function testPaginated(client){
    let result = await query.executePaginated(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, "event.sets");
    return result;
}