import Logger from "js-logger";
import {  parseActiveSherlockContests } from "./sherlockContestParser.js";
import fs from "fs"

Logger.useDefaults()

let active = await parseActiveSherlockContests([])

Logger.info(`parsed ${active.length} contests`)

fs.writeFileSync("sherlockContests.json", JSON.stringify(active, null, 2))
