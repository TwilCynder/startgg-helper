/**
 * @param {string} name 
 * @returns {Promise<Test>}
 */
export function loadScript(name){
    const filename = "./testScripts/" + name + ".js";
    return import(filename).then(module => module.default);
}

export async function loadAll(){
    const list = await fetch(import.meta.resolve("./list.json")).then(buf => buf.json());
    return Promise.all(list.map(async name => [name, await loadScript(name)]));
}