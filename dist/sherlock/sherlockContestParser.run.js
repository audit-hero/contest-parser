import { Logger } from "jst-logger";
import { parseActiveOrJudgingSherlockContests } from "./sherlockContestParser.js";
import fs from "fs";
let active = await parseActiveOrJudgingSherlockContests([]);
for (let i = 0; i < active.length; ++i) {
    Logger.info(`contest ${active[i].pk} has ${active[i].modules.length} modules`);
    // for (let j = 0; j < active[i].modules.length; ++j) {
    //   Logger.info(`${active[i].modules[j].url}`)
    // }
}
fs.writeFileSync("sherlockContests.json", JSON.stringify(active, null, 2));
//# sourceMappingURL=sherlockContestParser.run.js.map