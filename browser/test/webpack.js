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
try {
    await new Promise((resolve, reject) => {
        compiler.run((err, result) => {
            if (result.hasErrors()){
                reject("Error(s) in compilation : " + err + "\nResult : \n" + result.toString())
            }
            resolve();
        })
    })
    console.log("Bundled npm packages")
} catch (err){
    console.error("Could not compile npm packages : ")
    console.error(err);
}
