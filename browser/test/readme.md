## Browser package test system
This is a minimal website that should be served by a minimal web server ; which is not incuded and left to the user.  

Each script in `src/testScripts` provides a function that performs an API action, another that checks the validity of the result, and a name. These scripts are loaded dynamically by the page's script, which then runs the provided action and check. Their names are listed in `src/list.js`.

Specifying the name of a script in the URL properties under `test` loads only this test. 

This is a different architecture from the base package's test system, because I was 24 when I made this one and now I'm 26