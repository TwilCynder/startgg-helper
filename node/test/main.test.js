import { makeClient } from "./common.js";
import { testLong } from "./long.js";
import { testPaginated } from "./paginated.js";
import { testPaginatedComplex } from "./paginatedComplex.js";
import { testShort } from "./short";
import { testUpsets } from "./upsets.js";

test("Single query (event results)", async () => {
    expect(await testShort(makeClient())).toBeTruthy();
});

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


let upsets = [
    [1,1],
    [1,0],
    [1,1],
    [1,0],
    [0,1],
    [0,0],
    [0,1],
    [0,0],
]
test("Calculate upset factor on 8 sets across 2 events", async () => {
    let res = await testUpsets(makeClient());
    expect(res).toBeTruthy();
    expect(res).toStrictEqual(upsets);
}, 60000)