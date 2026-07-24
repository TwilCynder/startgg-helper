import fs from "fs/promises"

let dir = await fs.readdir(import.meta.dirname + "/src/testScripts");
let filenames = [];
for (const [_, filename] of dir.entries()){
    let [basename, _ext] = filename.split(".");
    filenames.push(basename);
}
//console.log(filenames);

await fs.writeFile(import.meta.dirname + "/src/list.json", JSON.stringify(filenames));