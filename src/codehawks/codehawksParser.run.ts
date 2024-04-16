import { parseActiveCodeHawksContests } from "./codehawksParser.js"
import fs from "fs"

let res = await parseActiveCodeHawksContests([])

fs.writeFileSync("codehawksContests.json", JSON.stringify(res, null, 2))
