import { makeClient } from "./common.js";
import { testLong } from "./long.js";
import { testPaginated } from "./paginated.js";
import { testShort } from "./short";

test("Single query (event results)", async () => {
    expect(await testShort(makeClient())).toBeTruthy();
});

test("100ish queries with delay-based limiter (sets)", async () => {
    expect(await testLong(makeClient())).toBeTruthy();
}, 120000);

test("Paginated query (sets)", async () => {
    expect(await testPaginated(makeClient())).toBeTruthy();
}, 60000);