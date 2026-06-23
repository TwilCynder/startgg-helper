import { getPlacementSuffix } from "../src/tournamentUtil";

export function testPlacementSuffix(){
    return [
        [0, 1, 2, 3, 4, 9, 10, 11, 12, 13, 20, 21, 21, 23, 25, 31, 37, 95, 100, 101, 102, 103, 113, 151, 154]
            .map(placement => getPlacementSuffix(placement)), 
        ["0th", "1st", "2nd", "3rd", "4th", "9th", "10th", "11th", "12th", "13th", "20th", "21st", "22nd", "23rd", "25th", "31st", "37th", "95th", "100th", "101st", "102nd", "103rd", "113th", "151st", "154th"]
    ];
}