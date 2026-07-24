import { Query } from "../dist/bundle.js";

let query = new Query(`
    query BogusTest ($slug: String) {
        event(slug: $slug) {
            id
        }
    }
`, 0);

async function runTest(client){
    let error = null;
    try {
        let res = await query.execute(client, {slug: "+not+a/slug/"});
        console.log("This shouldn't be here :", res)
    } catch (err){
        error = err;
    }
    return error;
}

export default {
    runTest,
    validate: () => false,
    name: "Error handling (bad request)"
}