import Logger from "js-logger";
import { parseActiveCantinaContests } from "./cantinaParser.js";
import fs from "fs";
Logger.useDefaults();
let res = await parseActiveCantinaContests([]);
fs.writeFileSync("c4Contests.json", JSON.stringify(res, null, 2));
//# sourceMappingURL=cantinaParser.run.js.map