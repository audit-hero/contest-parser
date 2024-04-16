import { parseActiveC4Contests } from "./c4ContestParser.js"
import fs from "fs"

let res = await parseActiveC4Contests([])

fs.writeFileSync("c4Contests.json", JSON.stringify(res, null, 2))