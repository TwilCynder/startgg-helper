import { Query } from "../dist/bundle.js";
import { StartGGDelayQueryLimiter } from "../dist/bundle.js";
import { getDoubleEliminationUpsetFactorFromSet } from "../dist/bundle.js";

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
export async function testUpsets(client, limiter){
   limiter = limiter || new StartGGDelayQueryLimiter();

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

let upsets = [
    [1,1],
    [1,0],
    [1,1],
    [1,0],
    [0,1],
    [0,0],
    [0,1],
    [0,0],
]

export async function validateUpsets(val) {
    if (!(val instanceof Array)) return "Expected an array, got " + val;
    if (val.length != upsets.length) return "Expecte an array of length " + upsets.length + ", got length " + val.length;
    for (let i = 0; i < upsets.length; i++){
        let set = val[i];
        let supposed = upsets[i];

        if (set[0] != supposed[0] || set[1] != supposed[1]) return "Upsets result for set" + i + " should be " + supposed + ", was" + set;
    }
    return false;
}