import Logger from "js-logger";
import { parseActiveSherlockContests } from "./sherlockContestParser.js";
import fs from "fs";
Logger.useDefaults();
let active = await parseActiveSherlockContests([]);
for (let i = 0; i < active.length; ++i) {
    Logger.info(`contest ${active[i].pk} has ${active[i].all_modules.length} modules`);
    for (let j = 0; j < active[i].all_modules.length; ++j) {
        Logger.info(`${active[i].all_modules[j].url}`);
    }
}
fs.writeFileSync("sherlockContests.json", JSON.stringify(active, null, 2));
//# sourceMappingURL=sherlockContestParser.run.js.map