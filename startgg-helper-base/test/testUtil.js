export function processData(result, key){
    return (result && result[key]) ?  result[key] : null;
}