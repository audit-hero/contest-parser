import { parseActiveCantinaContests } from "./cantinaParser.js"
import fs from "fs"

let res = await parseActiveCantinaContests([])

fs.writeFileSync("cantinaContests.json", JSON.stringify(res, null, 2))
