import { Query } from "../../src/query.js";

import { paginatedSchema } from "./commonRequests.js";

let query = new Query(paginatedSchema, 3);
query.log = {
    query: (params) => "Fetching sets for event " + params.slug + ", page " + params.page
}

export default async function testPaginated(client, limiter){
    let result = await query.executePaginated(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, "event.sets", limiter);
    return result;
}