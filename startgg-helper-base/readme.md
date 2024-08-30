# start.gg Helper

A set of functions and classes useful to interact with the start.gg GraphQL API.  

## You need to provide a client to interact with the API
The functions in this package usually take a "client" argument, which is a GraphQL client object. You need to handle this object yourself, which can be done using the `graphql` package, which is not a dependency of `startgg-helper` and must be installed manually.

### Why do this ?

The purpose of this package is to be usable not onlyin a node ecosystem but also in a browser project, using `browserify`. The `graphql` package does not work well with browserify, so I decided to let the user provide a client depending on their environment.

### Ok actually you can just use startgg-helper-node or startgg-helper-browser

If you don't want to handle the client yourself, you can simply install
- `startgg-helper-node` if you're on Node, it includes `graphql` and handles the client using this package
- `startgg-helper-browser` if you're doing a browser-based app using `browserify`, which provides a custom client class based on the `fetch` API.