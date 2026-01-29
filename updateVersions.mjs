import fs from "fs/promises"



function readJSON(path){
    return fs.readFile(path).then(buf => JSON.parse(buf.toString()));
}

function updateVersions(p, version){
    p.version = version;
    p.dependencies["startgg-helper"] = version;
}

async function update(name, version){
    const path = `./${name}/package.json`
    const p = await readJSON(path);
    updateVersions(p, version);
    fs.writeFile(path, JSON.stringify(p, null, 2))
}

const mainPackage = await readJSON("./base/package.json");
const version = mainPackage.version ?? process.argv[2];
if (!version){
    console.error("No version found");
    process.exit(1);
}

console.log("Setting version", version);

update("node", version);
update("browser", version);