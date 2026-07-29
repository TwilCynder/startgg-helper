async function doesScriptNotExist(name){
    const list = await fetch(import.meta.resolve("./list.json")).then(buf => buf.json());
    return list.includes(name) ? null : list;
}

/**
 * @param {string} name 
 * @returns {Promise<Test>}
 */
export async function loadScript(name){
    try {
        const filename = "./testScripts/" + name + ".js";
        return await import(filename).then(module => module.default);
    } catch (err){
        const res = await doesScriptNotExist(name);
        if (res){
            err = new Error("Script does not exist ; valid scripts name are " + res.map(name => `<a href="/index.html?test=${name}">${name}</a>`));
        }
        throw err;
    }

}

export async function loadAll(){
    const list = await fetch(import.meta.resolve("./list.json")).then(buf => buf.json());
    return Promise.all(list.map(async name => [name, await loadScript(name)]));
}