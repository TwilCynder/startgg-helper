import { deep_get, deep_get_raw, deep_set, deep_set_raw } from "../../src/jsUtil.js";

function catch_(f){
    try {
        return f()
    } catch (err){
        return "Error";
    }
}

function with_(x, f){
    return [x, f(x)];
}

function singleElementArray(i, val){
    let arr = [];
    arr[i] = val;
    return arr;
}

export default function testDeepFunctions(){
    return [
        [deep_get_raw({a: {b: {c: 12}}}, "default", "a", "b", "c"), 12],
        [deep_get_raw({a: {b: {c: 12}}}, "default", "a", "d", "c"), "default"],
        [catch_(() => deep_get_raw({a: {b: 12}}, "default", "a", "b", "c")), "default"],
        [deep_get_raw({a: [{}, {}, {c: 12}]}, "default", "a", 2, "c"), 12],
        [deep_get({a: {b: {c: 12}}}, "a.b.c", "default"), 12],
        [deep_get({a: {b: {c: 12}}}, "a.d.c", "default"), "default"],
        [catch_(() => deep_get({a: {b: 12}}, "a.b.c", "default")), "default"],
        [deep_get({a: [{}, {}, {c: 12}]}, "a.2.c", "default"), 12],
        [with_({a: {b: {c: 12}}}, (o) => deep_set_raw(o, 15, "a", "b", "c")), [{a: {b: {c: 15}}}, true]],
        [with_({a: {b: {c: 12}}}, (o) => deep_set_raw(o, 15, "a", "d", "c")), [{a: {b: {c: 12}}}, false]],
        [with_({a: []}, (o) => deep_set_raw(o, 15, "a", 2)), [{a: singleElementArray(2, 15)}, true]],
        [with_({a: {b: {c: 12}}}, (o) => deep_set(o, "a.b.c", 15)), [{a: {b: {c: 15}}}, true]],
        [with_({a: {b: {c: 12}}}, (o) => deep_set(o, "a.d.c", 15)), [{a: {b: {c: 12}}}, false]],
        [with_({a: []}, (o) => deep_set(o, "a.2", 15)), [{a: singleElementArray(2, 15)}, true]],
    ]
}