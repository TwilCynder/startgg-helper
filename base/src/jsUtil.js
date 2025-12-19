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
 * Traverses nested object following a path and returns what's at the end, without throwing an error if an intermediary object-property is not found.  
 * The "path" argument works like a JS object access expression, starting with a property from the initial object (first parameter)   
 * ```js
 * const obj = {a: {b: {c: 12}}};
 * obj.a.b.c; //value : 12
 * deep_get(obj, "a.b.c"); //returns 12
 * 
 * obj.a.d.c; //ERROR : Cannot read properties of undefined (reading 'c')
 * deep_get(obj, "a.d.c"); //returns null, no error
 * deep_get(obj, "a.d.c", 15);//returns 15, default value
 * ```
 * 
 * This function supports numbers as property names, which **works with arrays**.
 * ```js
 * const obj = {a: [{}, {}, {b: 12}]};
 * 
 * obj.a[2].b; value: 12
 * obj.a.2.b; Syntax ERROR
 * deep_get(obj, "a.2.b"); //returns 12
 * ```
 * 
 * @param {Object | Array} obj Object or array
 * @param {string} path See above
 * @param {*} def Value returned if the path cannot be followed to the end
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

/**
 * Traverses nest objects following a path and sets the final property to a given vallue.  
 * Traversing works the same as with deep_get()
 * @param {{}} obj 
 * @param {string} path 
 * @param {*} value 
 */
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
 * Returns an array containing the results of an array of functions, called without parameters. Any "undefined" result is ignored, meaning the resulting array can be smaller than the function array.
 * @param {(()=>any)[]} fArray 
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
 * Returns an array containing the results of all parameters, treated as functions, called without parameters. See fResultsArray
 * @param  {...(() => any)} functions 
 */
export function fResults(...functions){
    return fResultsArray(functions);
}

/**
 * Serializes a value to JSON text like JSON.stringify does. (this function is just a very thin wrapper only useful for the "pretty" parameter)
 * @param {any} data 
 * @param {boolean} pretty If true, the resulting JSON will be made to be human-readable, with 4-space indentation
 */
export function toJSON(data, pretty){
    return JSON.stringify(data, null, pretty ? 4 : undefined);
}//jsutil

/**
 * Take a wild guess
 * @param {any} n 
 */
export function isNumber(n){
    return typeof n == "number";
}

/**
 * Converts a data to a UNIX timestamp, i.e. number of seconds since 1/1/1970 00:00. Accepts : 
 * - JS Date objects
 * - strings and numbers : will be converted inta a Date like `new Date(d)` does. (number treated as UNIX timestamps with milisecond granularity, more complicated for strings)
 * @param {number | Date | string} d 
 */
export function toUNIXTimestamp(d){
    return isNaN(d) ? new Date(d).getTime() / 1000 : d;
}