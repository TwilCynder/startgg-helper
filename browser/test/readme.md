## Browser package test system
This is a minimal website that should be served by a basic web server ; which is not incuded and left to the user.  

### Usage
`./build.sh` must be run before testing.  

Each script in `src/testScripts` performs an API action, and check the validity of the result. They are identified by their filename (extension not included)  
The `./site/index.html` page runs all these tests, or a single test if its name is specified in the `test` URL search property (`/index.html?test=<testName>`)  
The `./site/list.html` page lists all possible tests runs, with clickable links to load `index.html` with the correct parameter.  

### Implementation detail

Each script in `src/testScripts` provides a function that performs an API action, another that checks the validity of the result, and a name. These scripts are loaded dynamically by the page's script, which then runs the provided action and check. Tests are listed in `./site/src/list.json`   

This is a different architecture from the base package's test system, because I was 24 when I made this one and now I'm 26