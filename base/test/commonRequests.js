export const paginatedSchema = `
    query Sets($slug: String, $page: Int, $perPage: Int) {
        event(slug: $slug){
            slug
            tournament {
                name
                numAttendees
            }
            sets(page: $page, perPage: $perPage){
                pageInfo {
                    totalPages
                }
                nodes {
                    id
                }
            }
        }
    }
`

export const basicSchema = `
query EventStandingsQuery($slug: String!) {
  event(slug: $slug) {
    id
    entrants (query: {perPage: 500}){
      nodes {
        id
        name
        participants {
          player {
            id
            gamerTag
          }
          user {
            id
            slug
          }
        }
      }
    }
  }
}
`