import { Query } from "./dist/bundle.js";
import { StartGGDelayQueryLimiter } from "./dist/bundle.js";

const schema = `
    query Sets($slug: String, $page: Int, $perPage: Int) {
        event(slug: $slug){
            sets(page: $page, perPage: $perPage){
                nodes {
                    id
                }
            }
        }		
    }
`

let query = new Query(schema, 3);
export async function testLong(client){
    try {
        let limiter = new StartGGDelayQueryLimiter();

        let promises = [];
        for (let i = 0; i < 50; i++){
            for (let j = 0; j < 2; j++){
                promises.push(query.execute(client, {
                    slug: `tournament/stock-o-clock-${i}/event/1v1-ultimate`,
                    page: j,
                    perPage: 10
                }, limiter));
            }
        }
        let result = await Promise.all(promises);
        limiter.stop();
        return result;
    } catch (err){
        console.error(err);
        return null;
    }

}