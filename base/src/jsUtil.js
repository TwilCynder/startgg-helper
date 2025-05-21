function processObjectPath(path){
    path = path=path.split('.');
    for (let i = 0; i < path.length; i++){
        if (/^\d/.test(path[i])){
            let n = parseInt(path[i]);
            if (!isNaN){
                path[i] = n;
            }
        }
    }
    return path;
}//jsutil

/**
 * 
 * @param {{}} obj 
 * @param {string} path 
 * @param {*} def 
 * @returns 
 */
export function deep_get(obj, path, def = null){
    //https://stackoverflow.com/a/8817473
    path = processObjectPath(path);

    for (var i=0, len=path.length; i<len; i++){
        obj = obj[path[i]];
        if (obj == undefined) return def;
    };
    return obj;
};

export function deep_set(obj, path, value){
    path = processObjectPath(path);

    let finalName = path.pop();
    for (let elt of path){
        obj = obj[elt];
        if (!(obj instanceof Object)){
            return false;
        }
    }
    obj[finalName] = value;
    return true;
}

let currentID = 1;
export function generateUniqueID(){
    return currentID++;
}//jsutil

/**
 * 
 * @param {(() => any)[]} fArray 
 */
export function fResultsArray(fArray){
    let result = [];
    for (let f of fArray){
        let res = f();
        if (res !== undefined){
            result.push(res);
        }
    }

    return result;
} 

/**
 * 
 * @param  {...(() => any)} functions 
 */
export function fResults(...functions){
    return fResultsArray(functions);
}

/**
 * 
 * @param {any} data 
 * @param {boolean} pretty 
 */
export function toJSON(data, pretty){
    return JSON.stringify(data, null, pretty ? 4 : undefined);
}//jsutil

export function isNumber(n){
    return typeof n == "number";
}

/**
 * 
 * @param {number | Date | string} d 
 */
export function toUNIXTimestamp(d){
    return isNaN(d) ? new Date(d).getTime() / 1000 : d;
}