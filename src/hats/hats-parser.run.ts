import Logger from "js-logger";
import fs from "fs"
import { parseActiveHatsContests } from "./hats-parser.js";

Logger.useDefaults()

let res = await parseActiveHatsContests([])

console.log(`got ${res.length} hats contests`);

fs.writeFileSync("hats.json", JSON.stringify(res, null, 2))
