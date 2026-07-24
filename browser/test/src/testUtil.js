import { deep_get } from "../dist/bundle.js";

export function processData(result, key){
    return (result && result[key]) ?  result[key] : null;
}

export function truthyValidator(path){
    return (val) => {
        if (path) val = deep_get(path);
        return (val ? false : ("Expected " + (path ?? "result") + " to be true, got" + val))
    }
}

export function equalValidator(equals, path){
    return (val) => {
        if (path) val = deep_get(val, path);
        return (val === equals ? false : ("Expected " + (path ?? "result") + " to be " + equals + ", got " + val))
    }
}