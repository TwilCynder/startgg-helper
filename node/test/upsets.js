import { Query } from "startgg-helper";
import { StartGGDelayQueryLimiter } from "startgg-helper";
import { getDoubleEliminationUpsetFactorFromSet } from "startgg-helper";

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
export async function testUpsets(client){
   let limiter = new StartGGDelayQueryLimiter();

    try {

        let promises = [];
        for (let i = 1; i < 3; i++){
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

        return upsets;
    } catch (err){
        console.error(err);
        return null;
    } finally {
        limiter.stop();
    }
}