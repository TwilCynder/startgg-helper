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

export function getDoubleEliminationPlacementTier(placement){
    for (let tier of placements){
        if (placement <= tier) return tier;
    }
}

/**
 * Returns the difference in placement tier between two placements (positive if the first placement is better). This can be used to compute an upset factor, but also an SPR (which is pretty much the upset factor between one's real placement and their seed)
 * @param {number} seed1 If you're looking for an SPR this is the real placement, if you're looking for a win upset factor this is the winner's seed
 * @param {number} seed2 If you're looking for an SPR this is the predicted placement (= seed), if you're looking for a win upset factor this is the loser's seed
 * @returns 
 */
export function getUpsetFactor(seed1, seed2){
    let finalTierIndex, predictedTierIndex;
    for (let i = 0; i < placements.length; i++){
        const upperLimit = placements[i];
        
        if (seed1 <= upperLimit && !finalTierIndex){
            finalTierIndex = i + 1;
            if (predictedTierIndex) break;
        }

        if (seed2 <= upperLimit && !predictedTierIndex){
            predictedTierIndex = i + 1;
            if (finalTierIndex) break;
        }
    }
    if (!finalTierIndex || !predictedTierIndex) return NaN

    return predictedTierIndex - finalTierIndex;
}

export function getDoubleEliminationUpsetFactorFromSeeds(winnerSeed, loserSeed){
    return getUpsetFactor(winnerSeed, loserSeed)
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

