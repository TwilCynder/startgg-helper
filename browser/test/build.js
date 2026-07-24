import fs from "fs/promises"
import { loadScript } from "./site/src/loadScripts.js";

let dir = await fs.readdir(import.meta.dirname + "/site/src/testScripts");
let filenames = [];
for (const [_, filename] of dir.entries()){
    let [basename, _ext] = filename.split(".");
    filenames.push(basename);
}
//console.log(filenames);

await fs.writeFile(import.meta.dirname + "/site/src/list.json", JSON.stringify(filenames));

const tests = await Promise.all(filenames.map(async filename => [filename, await loadScript(filename)]));

await fs.writeFile(import.meta.dirname + "/site/list.html", `
<html>
    <head><link href = "index.css" rel="stylesheet"></head>
    <body>
        <a id="all" href="/index.html">Run all tests</a><br>
        <ul>
            ${tests.map(([id, test]) => `<li><a id=test-${id}" href="/index.html?test=${id}">${test.name}</a></li>`).join("")}
        </ul>
        
    </body>
</html>
`)