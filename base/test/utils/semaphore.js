import { TimedSemaphore } from "../../src/queryLimiter_new.js";

export async function testTS(){
    let ts = new TimedSemaphore(4, 1000);

    for (let i = 0; i < 18; i++){
        console.log("Iteration begin", i);
        await ts.lock();
        console.log("Iteration", i);
    }

    ts.stop();
}