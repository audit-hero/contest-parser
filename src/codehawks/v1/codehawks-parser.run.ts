import Logger from "js-logger";
import { parseActiveCodeHawksContests } from "./codehawks-parser.js";
import fs from "fs"
Logger.useDefaults()

let res = await parseActiveCodeHawksContests([])

fs.writeFileSync(`./codehawksContests.json`, JSON.stringify(res, null, 2))