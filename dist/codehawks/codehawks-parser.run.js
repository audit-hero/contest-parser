import { parseActiveCodeHawksContests } from "./codehawks-parser.js";
import fs from "fs";
let res = await parseActiveCodeHawksContests([]);
fs.writeFileSync(`./codehawksContests.json`, JSON.stringify(res, null, 2));
//# sourceMappingURL=codehawks-parser.run.js.map