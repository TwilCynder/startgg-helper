# start.gg Helper

A set of functions and classes useful to interact with the [start.gg GraphQL API](https://developer.start.gg/docs/intro/). It does NOT provide abstractions for the actual data retrieved from the API (events, players, sets, etc), only eases making the queries. An understanding of [GraphQL](https://graphql.org/learn/introduction/), and [start.gg's GraphQL Schema](https://smashgg-schema.netlify.app/reference/query.doc.html) are necessary to leverage the API through this package. 

## You need to provide a client to interact with the API  
tl;dr : you're probably looking for `startgg-helper-node` or `startgg-helper-browser`.

To interact with the API, the functions in this package need (and take as argument) a "client" object, able to send requests to the GraphQL API. Such a client **is not provided by this package**. This is to ensure that this package is usable not only in a node ecosystem, but also in browser front-end code : sending requests to an API is done differently in browser-oriented code and usual NodeJS code, meaning that providing a client in this package would make it unfit for at least some purposes.  
Two packages exist to solve that issue : 
- `startgg-helper-node`, which includes this one and provides a client using the `graphql` package : this is for your NodeJS projects
- `startgg-helper-browser`, which includes this ont and provides a simple client relying on the `fetch` API : this is for your web projects, to be run by a browser (using a tool like `browserify` to make your node package usable on browser)

### I still want to use this package and provide my own client
OK ! A client is actually a very simple thing : all it needs is a `request(schema, variables)` method, taking a GraphQL schema as a string and a collection of variables as an object. As long as your object exposes this method, and it correctly returns the result of the desired GraphQL request, it can be passed to `startgg-helper` functions.

## Quick Doc
[Full focumentation here](./doc.md)

The basic feature of this package is the `Query` object, which represents a GraphQL Schema/Document. Its methods allow to execute the query (i.e. make a GraphQL request with the defined schema) with different variables, with automatic retries in case of failure.

```js
const schema = `
query Test($slug: String, $page: Int, $perPage: Int){
    event(slug: $slug) {
        sets(page: $page, perPage: $perPage){
            nodes {
                id
                state
            }
        }
    }
}
`

const query = new Query(schema, 3); //3 is the default number of retries

let res = await Promise.all([
    "tournament/my-tournament-1/event/ult-singles",
    "tournament/my-tournament-2/event/ult-singles",
].map(async slug => await query.execute(client, {slug, page: 1})))
```

### Paginated collections and queries
Paginated collections are collections not represented by a GraphQL Array, but a page system, where each query needs to specify the index and size of the page it's fecthing. See the start.gg API for more information.  
A paginated collection of type T is represented by a field with a `page` and `perPage` parameter returning a Connection-style type : 
```graphql
field(page: Int, perPage: Int): TConnection
 
type TConnection {
    pageInfo: PageInfo

    nodes: [T]
}
 
type PageInfo {
  total: Int
  totalPages: Int
  page: Int
  perPage: Int 
}
```

The `Query.executePaginated` method can be used to query entire paginated collections, by qerying repeatedly while increasing a certain parameter of the query, which must be used as the page argument of paginated collection field in the query, which you need to point to using the path parameter, and agregating the elements of each page into one single array. The page argument will be controlled entirely by the loop and doesn't need to be included with other graphQL variables. If the pageInfo.totalPages field is included in your schema, it will be used to determine the last page ; if not, this method will stop once it receives an empty page. 

Example : 

```graphql
query Example($page: Int){
  topField {
    field2(page: $page){
      pageInfo {
        totalPages
      }
      nodes {
        ...
      }
    }
  }
}
```
```js
query.executePaginated(client, {}, "topfield.field2")
``` 

### Limiters : dealing with the API rate limit
The start.gg API has a rate limit of (as of writing this) 80 requests per minute per API key. To avoid exceeding this limit, `startgg-helper` provide a client-side rate-limiting mechanism, that comes in the form of objects you can pass to request-sending functions. 

```js
const limiter = new StartGGDelayQueryLimiter(); //it is important to only create and use one in the entire program.

for (let i = 0; i < 200; i++){
    query.execute(client, {slug: `tournament/my-tournament-${i}/event/ult-singles`}, limiter);
}
//queries will be delayed to avoid exceeding start.gg's rate limit
```

there are a handful of limiter classes but only a few are useful to you (some others are here only for legacy)
- DelayQueryLimiter(rpm) : allows up to `rpm` request per minute
- StartGGDelayQueryLimiter : allows up to 60 request per minute. This is intentionally lower than the actual server-side limit, to prevent network timing mishaps from making us accidentally going over. 

### Etc
This package also provides lots of utility functions ; see the [full doc](./doc.md)