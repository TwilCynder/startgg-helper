import fs from "fs/promises"

let dir = await fs.readdir(import.meta.resolve("./src/testScripts"));
for (const entry of dir.entries()){
    console.log(entry);
}