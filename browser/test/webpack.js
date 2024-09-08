#! node

import webpack from "webpack"
import {dirname, resolve} from "path"

let compiler = webpack({
    entry: new URL("../main.js", import.meta.url).toString() ,
    output: {
        path: resolve(import.meta.dirname, "./dist"),
        filename: "bundle.js",
        library: {
            type: "module"
        },
        
    },
    mode: "none",
    experiments: {
        outputModule: true
    }
});

console.log("Running webpack bundler")
compiler.run();
console.log("Bundled npm packages")