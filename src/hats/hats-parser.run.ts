import fs from "fs"
import { parseActiveHatsContests } from "./hats-parser.js";

let res = await parseActiveHatsContests([])

console.log(`got ${res.length} hats contests`);

fs.writeFileSync("hats.json", JSON.stringify(res, null, 2))
