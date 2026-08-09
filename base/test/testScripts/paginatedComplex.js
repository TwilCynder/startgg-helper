import { Query } from "../../src/query.js";
import { paginatedSchema } from "./commonRequests.js";

let query = new Query(paginatedSchema, 3);

query.paginatedLog = (params) => {
    const tournamentSlug = params.slug.split("/")[1];
    return {
        query: (params) => "Fetching sets for event 1v1-ultimate of tournament " + tournamentSlug + ", page " + params.page
    }
}

export default async function testPaginatedComplex(client, limiter){
    let progressLogs = [];

    let data = await query.executePaginated(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, "event.sets", limiter, {
        perPage: 10,
        startingPage: 2,
        initialData: [{fakeSetForTesting: true}],
        includeWholeQuery: Query.IWQModes.INLINE,
        maxElements: 100, 
        callback: (localresult, _currentResult, page, totalPages) => {
            //console.log("Page", i, ":", localresult);
            progressLogs.push([localresult.length, page, totalPages]);
        }
    });
    return [{data, progressLogs}, {length: 100, progressLogs: [
        [10,2,16],
        [10,3,16],
        [10,4,16],
        [10,5,16],
        [10,6,16],
        [10,7,16],
        [10,8,16],
        [10,9,16],
        [10,10,16],
        [10,11,16]
    ]}];
}