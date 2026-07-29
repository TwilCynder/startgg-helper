import { StartGGDelayQueryLimiter } from "../src/queryLimiter.js";
import { createClientAuto } from "./client.js";
import testLong from "./testScripts/long.js";
import testPaginated from "./testScripts/paginated.js";
import testPaginatedComplex from "./testScripts/paginatedComplex.js";
import testShort from "./testScripts/short.js";
import testPlacementSuffix from "./testScripts/placementSuffix.js";
import testUpsets from "./testScripts/upsets.js"; 

console.log("Quick mode :", !!process.env.QUICK)

const client = await createClientAuto();
const limiter = new StartGGDelayQueryLimiter();

test("Single query (event results)", async () => {
    expect(await testShort(client, limiter)).toBeTruthy();
});

if (!process.env.QUICK)
test("100ish queries with delay-based limiter (sets)", async () => {
    expect(await testLong(client, limiter)).toBeTruthy();
}, 120000);

test("Paginated query (sets)", async () => {
    expect(await testPaginated(client, limiter)).toBeTruthy();
}, 60000);

test("Paginated query (sets) with advanced options", async () => {
    let res = await testPaginatedComplex(client, limiter);
    expect(res).toBeTruthy();
    expect(res.event.tournament).toBeTruthy();
    expect(res.event.sets.nodes.length).toBe(100);
}, 60000);


test("Calculate upset factor on 8 sets across 2 events", async () => {
    let [res, expected] = await testUpsets(client, limiter);
    expect(res).toBeTruthy();
    expect(res).toStrictEqual(expected);
}, 60000)

test("Placement suffixes", () => {
    let [res, expected] = testPlacementSuffix();
    expect(res).toStrictEqual(expected);
})