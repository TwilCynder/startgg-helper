const placements = [
        1,       2,      3,      4,       6,
        8,      12,     16,     24,      32,
       48,      64,     96,    128,     192,
      256,     384,    512,    768,    1024,
     1536,    2048,   3072,   4096,    6144,
     8192,   12288,  16384,  24576,   32768,
    49152,   65536,  98304, 131072,  196608,
   262144,  393216, 524288, 786432, 1048576,
  1572864, 2097152
]
//sggutil

/**
 * Extracts a slug from a string. Can be either the slug directly or the full URL.
 * @param {string} string 
 */
export function extractSlug(string){
    if (string.includes("start.gg/")){
        return string.split("start.gg/")[1];
    } 
    return string;
}

/**
 * 
 * @param {string[]} list 
 * @returns 
 */
export function extractSlugs(list){
    return list.map(str => extractSlug(str));
}

export function getDoubleEliminationPlacementTier(placement){
    for (let tier of placements){
        if (placement <= tier) return tier;
    }
}

export function getDoubleEliminationUpsetFactorFromSeeds(winnerSeed, loserSeed){
    if (winnerSeed < loserSeed) return 0;

    let winnerExpectedTierID = -1, loserExpectedTierID = -1;

    for (let i = 0; i < placements.length; i++){
        if (winnerSeed <= placements[i]) {winnerExpectedTierID = i; break;}
    }

    for (let i = 0; i < placements.length; i++){
        if (loserSeed <= placements[i]) {
            loserExpectedTierID = i;
            break;
        } 
    }

    if (!winnerExpectedTierID < 0 || !loserExpectedTierID < 0) return undefined;

    return (winnerExpectedTierID - loserExpectedTierID);
}

export function getDoubleEliminationUpsetFactorFromSet(set){
    let score1 = set.slots[0].standing.stats.score.value;
    let score2 = set.slots[1].standing.stats.score.value;
    let seed1 = set.slots[0].entrant.initialSeedNum;
    let seed2 = set.slots[1].entrant.initialSeedNum;

    if (score1 < 0 || score2 < 0) return [0, 0];

    //console.log(set.slots[0].entrant.name, set.slots[1].entrant.name);
    //console.log(score1, score2, seed1, seed2);

    return (score1 > score2) ? [getDoubleEliminationUpsetFactorFromSeeds(seed1, seed2), 0] : [getDoubleEliminationUpsetFactorFromSeeds(seed2, seed1), 1];
}

/**
 * Returns the tournament part in an event slug. Assumes the event slug is valid
 * @param {string} eventSlug 
 */
export function getTournamentSlugFromEventSlug(eventSlug){
    return eventSlug.split(/\/event/g)[0];
}