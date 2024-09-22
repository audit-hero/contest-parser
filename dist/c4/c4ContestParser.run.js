import { LogLevel, Logger } from "jst-logger";
import { parseActiveOrJudgingC4Contests } from "./c4ContestParser.js";
import fs from "fs";
Logger.setLevel(LogLevel.TRACE);
let res = await parseActiveOrJudgingC4Contests([]);
fs.writeFileSync("c4Contests.json", JSON.stringify(res, null, 2));
//# sourceMappingURL=c4ContestParser.run.js.map