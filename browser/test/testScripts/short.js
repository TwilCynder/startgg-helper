import { Query } from "../dist/bundle.js";
import { processData } from "./testUtil.js";

const schema = `
query EventStandingsQuery($slug: String!) {
  event(slug: $slug) {
    id
    entrants (query: {perPage: 500}){
      nodes {
        id
        name
        participants {
          player {
            id
            gamerTag
          }
          user {
            id
            slug
          }
        }
      }
    }
  }
}
`

let query = new Query(schema, 3);
export async function testShort(client, limiter){
  let result = await query.execute(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, limiter);
  return processData(result, "event");
}