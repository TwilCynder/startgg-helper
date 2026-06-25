import { Query } from "../src/query.js";
import { StartGGDelayQueryLimiter } from "../src/queryLimiter.js";
import { getDoubleEliminationUpsetFactorFromSet } from "../src/tournamentUtil.js";

const schema = `
    query Sets($slug: String, $page: Int, $perPage: Int) {
        event(slug: $slug){
            sets(page: $page, perPage: $perPage){
                nodes {
                    round
                    fullRoundText
                    slots{
                        entrant {
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
                            initialSeedNum
                        }
                        standing {
                            placement
                            stats {
                                score {
                                    value   
                                }
                            }
                        }
                    }
                }
            }
        }		
    }
`

let query = new Query(schema, 3);
query.log = {
    query: params => `Fetching sets from event ${params.slug} (page ${params.page})`,
    error: params => `Request failed for event ${params.slug} (page ${params.page})`
}

let expected = [
    [1,1],
    [1,0],
    [1,1],
    [1,0],
    [0,1],
    [0,0],
    [0,1],
    [0,0],
]

export async function testUpsets(client){
   let limiter = new StartGGDelayQueryLimiter();

    try {
        let promises = [];
        for (let i = 0; i < 3; i++){
            for (let j = 0; j < 2; j++){
                promises.push(query.execute(client, {
                    slug: `tournament/stock-o-clock-${i}/event/1v1-ultimate`,
                    page: j,
                    perPage: 2
                }, limiter));
            }
        }
        let result = await Promise.all(promises);

        let upsets = []

        for (let event of result){
            if (!event || !event.event) continue;
            for (let set of event.event.sets.nodes){
                upsets.push(getDoubleEliminationUpsetFactorFromSet(set));
            }
        }

        return [expected, upsets];
    } catch (err){
        console.error(err);
        return null;
    } finally {
        limiter.stop();
    }
}