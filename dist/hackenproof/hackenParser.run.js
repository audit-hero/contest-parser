import { LogLevel, Logger } from "jst-logger";
import { setPlaywrightConfig } from "../web-load/playwright-loader.js";
import { parseActiveHackenContests } from "./hackenParser.js";
import fs from "fs";
import playwright from "playwright";
Logger.setLevel(LogLevel.TRACE);
const browser = await playwright.chromium.launch({
    headless: true,
});
setPlaywrightConfig({
    wait: 1000,
    browser,
});
let res = await parseActiveHackenContests([]);
fs.writeFileSync("hackenContests.json", JSON.stringify(res, null, 2));
process.exit(0);
//# sourceMappingURL=hackenParser.run.js.map