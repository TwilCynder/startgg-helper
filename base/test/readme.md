## Base package test system

The `testScripts` dir contains test scripts that **perform an API action** and **do not check the validity of the result**. Tests that should return a specific value return is along with the result, other tests are considered successful if they returned a value with no error.  
The tests can be launched either by using : 
- main.js : launches tests enabled by arguments (use -h for switches list), and display their results (including expected value when applicable)
- main.jest.js : run by `jest`, which should be launched by `./jest.sh` or `npm run test`. It launches all tests and **checks the validity of their results**
    - Arguments for `jest.sh` : `-v` to display the test script's output to stdout, and `-q` to skip long tests.

/!\ This test system relies on code from the `node` (located in `../../node`) package to interact with the API (since the `base` package we are testing does not provide a way to interact with the API, we borrow that from `base`). This means that for these tests to work, you need `base` to have its dependencies installed.