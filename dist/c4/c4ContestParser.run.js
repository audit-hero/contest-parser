import Logger from "js-logger";
import { parseActiveC4Contests } from "./c4ContestParser.js";
Logger.useDefaults();
let res = await parseActiveC4Contests([]);
let i = 1;
console.log(JSON.stringify(res, null, 2));
//# sourceMappingURL=c4ContestParser.run.js.map