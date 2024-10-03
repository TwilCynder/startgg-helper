export const schema = `
    query Sets($slug: String, $page: Int, $perPage: Int) {
        event(slug: $slug){
            slug
            tournament {
                name
                numAttendees
            }
            sets(page: $page, perPage: $perPage){
                nodes {
                    id
                }
            }
        }		
    }
`