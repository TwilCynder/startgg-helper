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
}


/**
 * Traverses nested objects using a sequence of property keys and returns the last property : for each string specified in the *names* parameter, take the property of *obj* with that name, treat it as the new *obj* then moves on to the next ; the last property is returned. If any object does not have the specified property during the sequence, the loop stops and *def* is returned. However, if any intermediary property exists but is not indexable, an error will occur.
 * 
 * ```js
 * const obj = {a: {b: {c: 12}}};
 * deep_get_raw(obj, null, "a", "b", "c"); //returns 12, same as obj.a.b.c
 * ```
 * 
 * Arrays indexes are treated just as any other property key : 
 * ```js
 * const obj = {a: [{}, {}, {b: 12}]};
 * deep_get_raw(obj, null, "a", 2, "b"); //returns 12
 * ```
 * 
 * @param {any} obj 
 * @param {any} def 
 * @param  {...PropertyKey} names 
 */
export function deep_get_raw(obj, def = null, ...names){
    for (const name of names){
        obj = obj[name];
        if (obj == undefined || obj == null) return def;
    };
    return obj;
}

/**
 * Traverses nested objects using a sequence of property keys, just like {@link deep_get_raw} ; the last property key in the last object is set to *value*.
 * ```js
 * const obj = {a: {b: {c: 12}}}; //obj.a.b.c is 12
 * deep_set_raw(obj, 15, "a", "b", "c");
 * obj.a.b.c; //is now 15
 * ```
 * @param {Object} obj 
 * @param {any} value 
 * @param  {...PropertyKey} names 
 * @returns 
 */
export function deep_set_raw(obj, value, ...names){
    let finalName = names.pop();
    for (let elt of names){
        obj = obj[elt];
        if (!(obj instanceof Object)){
            return false;
        }
    }
    obj[finalName] = value;
    return true;
}

/**
 * Traverses nested objects using a sequence of property keys (provided as a single string with property names separated by dots, just like a JS-style object access expression) and returns the last property : for each name in the path, take the property of *obj* with that name, treat it as the new *obj* then moves on to the next ; the last property is returned. property keys are provided as a "path" mimickng a JS object access expression, with  If any object does not have the specified property during the sequence, the loop stops and *def* is returned. However, if any intermediary property exists but is not indexable, an error will occur.
 * 
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
 * This function supports numbers as property names, which **works with arrays**. Standard array access syntax (`[]`) **is not supported**
 * ```js
 * const obj = {a: [{}, {}, {b: 12}]};
 * 
 * obj.a[2].b; value: 12
 * obj.a.2.b; Syntax ERROR
 * deep_get(obj, "a.2.b"); //returns 12
 * deep_ger(obj, "a[2].b"); //ERROR
 * ```
 * 
 * @param {Object | Array} obj Object or array
 * @param {string} path See above
 * @param {*} def Value returned if the path cannot be followed to the end
 */
export function deep_get(obj, path, def = null){
    return deep_get_raw(obj, def, ...processObjectPath(path));
};

/**
 * Traverses nested objects using a path of property keys, just like {@link deep_get} ; the last property key in the last object is set to *value*.
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

/**
 * Creates a Map from an array of objects, using one of the object's properties as their key
 * @template {Object} T
 * @param {T[]} array Array of objects
 * @param {string} property Name of the object's property that will be used as their key in the map
 */
export function arrayToMap(array, property){
    return new Map(array.map(obj => [obj[property], obj]))
}