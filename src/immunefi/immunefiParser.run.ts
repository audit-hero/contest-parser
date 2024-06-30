import { setPlaywrightConfig } from "../web-load/playwright-loader.js"
import { parseActiveImmunefiContests } from "./immunefiParser.js"
import playwright from "playwright"
import fs from "fs"

setPlaywrightConfig({
  wait: 1000,
  browser: await playwright.chromium.launch({ headless: true }) as any,
})

let res = await parseActiveImmunefiContests([])
fs.writeFileSync("immunefiContests.json", JSON.stringify(res, null, 2))
process.exit(0)
