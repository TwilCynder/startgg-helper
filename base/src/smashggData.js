export function removeTags(name){
    return name.split("|").at(-1).trim();
}//sggutil

/**
 * Extracts a slug from a string. Can be either the slug directly or the full URL.
 * @param {string} string 
 */
export function extractSlug(string){
    if (string.includes("start.gg/")){
        string = string.split("start.gg/")[1];
    };
    string = string.split("/").slice(0, 4).join("/");
    return string;
}

/**
 * 
 * @param {string[]} list 
 * @returns 
 */
export function extractSlugs(list){
    return list.map(str => extractSlug(str));
}

/**
 * Returns the tournament part in an event slug. Assumes the event slug is valid
 * @param {string} eventSlug 
 */
export function getTournamentSlugFromEventSlug(eventSlug){
    return eventSlug.split(/\/event/g)[0];
}