import { parseActiveHatsContests } from "./hats-parser.js"

let res = await parseActiveHatsContests([])

console.log(`got ${res.length} hats contests`);
