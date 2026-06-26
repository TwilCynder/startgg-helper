import { makeClient } from "./common.js";
import { testLong } from "./long.js";
import { testPaginated } from "./paginated.js";
import { testPaginatedComplex } from "./paginatedComplex.js";
import { testShort } from "./short.js";
import { testPlacementSuffix } from "./tournamentUtil.js";
import { testUpsets } from "./upsets.js"; 

console.log("Quick mode :", !!process.env.QUICK)

test("Single query (event results)", async () => {
    expect(await testShort(makeClient())).toBeTruthy();
});

if (!process.env.QUICK)
test("100ish queries with delay-based limiter (sets)", async () => {
    expect(await testLong(makeClient())).toBeTruthy();
}, 120000);

test("Paginated query (sets)", async () => {
    expect(await testPaginated(makeClient())).toBeTruthy();
}, 60000);

test("Paginated query (sets) with advanced options", async () => {
    let res = await testPaginatedComplex(makeClient());
    expect(res).toBeTruthy();
    expect(res.event.tournament).toBeTruthy();
    expect(res.event.sets.nodes.length).toBe(100);
}, 60000);


test("Calculate upset factor on 8 sets across 2 events", async () => {
    let [res, expected] = await testUpsets(makeClient());
    expect(res).toBeTruthy();
    expect(res).toStrictEqual(expected);
}, 60000)

test("Placement suffixes", () => {
    let [res, expected] = testPlacementSuffix();
    expect(res).toStrictEqual(expected);
})