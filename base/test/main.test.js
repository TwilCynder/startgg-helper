import { createClientAuto } from "./client.js";
import { testLong } from "./testScripts/long.js";
import { testPaginated } from "./testScripts/paginated.js";
import { testPaginatedComplex } from "./testScripts/paginatedComplex.js";
import { testShort } from "./testScripts/short.js";
import { testPlacementSuffix } from "./testScripts/tournamentUtil.js";
import { testUpsets } from "./testScripts/upsets.js"; 

console.log("Quick mode :", !!process.env.QUICK)

const client = await createClientAuto();

test("Single query (event results)", async () => {
    expect(await testShort(client)).toBeTruthy();
});

if (!process.env.QUICK)
test("100ish queries with delay-based limiter (sets)", async () => {
    expect(await testLong(client)).toBeTruthy();
}, 120000);

test("Paginated query (sets)", async () => {
    expect(await testPaginated(client)).toBeTruthy();
}, 60000);

test("Paginated query (sets) with advanced options", async () => {
    let res = await testPaginatedComplex(client);
    expect(res).toBeTruthy();
    expect(res.event.tournament).toBeTruthy();
    expect(res.event.sets.nodes.length).toBe(100);
}, 60000);


test("Calculate upset factor on 8 sets across 2 events", async () => {
    let [res, expected] = await testUpsets(client);
    expect(res).toBeTruthy();
    expect(res).toStrictEqual(expected);
}, 60000)

test("Placement suffixes", () => {
    let [res, expected] = testPlacementSuffix();
    expect(res).toStrictEqual(expected);
})