/**
 * @param {any[][]} matrix 
 * @param {number?} lineSize 
 * @returns 
 */
export function transposeMatrix(matrix, lineSize){
    lineSize = lineSize ?? matrix[0].length;
    let res = Array.from({length: lineSize}, () => []);
    for (const line of matrix){
        for (let i = 0; i < line.length; i++){
            res[i].push(line[i]);
        }
    }
    return res;
}