# Documentation
This is an exhaustive documentation of utilies exported by this package. 

## Query class

A GraphQL Document/Schema. Allows easily batch-requesting with the same schema but different parameters. 

### constructor(schema, maxTries)
#### Parameters
- `schema: string` the GraphQL schema for this query
- `maxTries: number` 

### .execute()
`execute(client, params, limiter = null, silentErrors = false, maxTries = null)`  
Executes the query with given parameters, retrying in case of failure. 

#### Parameters
*   `client: GraphQLClient` A client object ; class not provided by this package, either use startgg-helper-node (or -browser) or refer to README.md
*   `params: Object` GraphQL variables
*   `limiter: TimedQuerySemaphore` A request limiter object; see [TimedQuerySemaphore](#TimedQuerySemaphore) (optional, default `null`)
*   `silentErrors: boolean` (optional, default `false`)
*   `maxTries: number` Overrides the default maximum tries count for this query. (optional, default `null`)

**Returns** the result of the query as-is

### .executePaginated()
`executePaginated(client, params, connectionPathInQuery, limiter = null, config = {}, silentErrors = false, maxTries = null)`  

Queries a whole paginated collection (of a *Connection type). This is done through executing the query repeatedly while increasing the page index each time.    
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

This method queries repeatedly while increasing a certain parameter of the query, which must be used as the page argument of paginated collection field in the query, which you need to point to using the path parameter, and agregating the elements of each page into one single array. The page argument will be controlled entirely by the loop and doesn't need to be included with other graphQL variables. If the pageInfo.totalPages field is included in your schema, it will be used to determine the last page ; if not, this method will stop once it receives an empty page. 

Example : 

```graphql
query Example($page: Int){
  topField {
    field2(page: $page, perPage: 50){
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
query.executePaginated(client, {}, "topfield.field2");
//Will send this query once for each page in the field2 collection, agregating page elements into a single array. 
``` 

#### Parameters

*   `client: GraphQLClient` See [.execute()](#executeclient-params-limiter--null-silenterrors--false-maxtries--null)
*   `params: Object` GraphQL variables
*   `limiter: TimedQuerySemaphore` A request limiter object; see [TimedQuerySemaphore](#TimedQuerySemaphore) (optional, default `null`)
*   `config: Object` configuration objects. Properties :
    - `pageParamName: string`: name of the GraphQL variable used to control the page index (your query must use it as the page index of the target collection)
    - `delay: number` : number of miliseconds to wait for between each query. No delay if absent.
    - `maxElements: number`: if present, queries will stop once this many elements have been fetched
    - `includeWholeQuery: number`: controls the structure of the result. Use the Query.IWQModes for values
      - `IWQModes.DONT` : only an array is returned 
      - `IWQModes.INLINE` : the whole query is returned with the `nodes` field replaced with the full array, 
      - `IWQModes.OUT` : this functions returns a tuple containing the aggregated collection and the rest of the query
      - `IWQModes.DUPLICATE` : both INLINE and OUT*
    - `callback: (localResult: T[]) => T[]` : a callback function called for each fetched page, with the page elements and the page index. It should return an array itself, which will be treated as the actual page (allowing users to transform the pages on the fly) ; if it does not, the paginated execution is stopped.
*   `silentErrors: boolean` (optional, default `false`)
*   `maxTries: number` Overrides the default maximum tries count for this query. (optional, default `null`)
*   

## TimedQuerySemaphore (and other Limiter classes)

A class providing timed