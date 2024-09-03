import { makeClient } from "./common.js";
import { testShort } from "./short";

test("Single query (event results)", async () => {
    expect(await testShort(makeClient())).toBeTruthy();
});