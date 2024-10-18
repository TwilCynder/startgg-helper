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
export async function testPaginated(client){
    let result = await query.executePaginated(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, "event.sets");
    return result;
}