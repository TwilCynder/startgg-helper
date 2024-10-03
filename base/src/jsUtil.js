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