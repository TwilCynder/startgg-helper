import { Query } from "../src/query.js";

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

let query = new Query(schema);
export async function testShort(client){
    let result = await query.execute(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"});
    console.log(result)
}