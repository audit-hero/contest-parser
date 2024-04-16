import { parseActiveImmunefiContests } from "./immunefiParser.js";
import fs from "fs";
let res = await parseActiveImmunefiContests([]);
fs.writeFileSync("immunefiContests.json", JSON.stringify(res, null, 2));
//# sourceMappingURL=immunefiParser.run.js.map