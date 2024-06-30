import { setPlaywrightConfig } from "../web-load/playwright-loader.js";
import { parseActiveCantinaContests } from "./cantinaParser.js";
import fs from "fs";
import playwright from "playwright";
setPlaywrightConfig({
    wait: 1000,
    browser: await playwright.chromium.launch({ headless: true }),
});
let res = await parseActiveCantinaContests([]);
fs.writeFileSync("cantinaContests.json", JSON.stringify(res, null, 2));
process.exit(0);
//# sourceMappingURL=cantinaParser.run.js.map