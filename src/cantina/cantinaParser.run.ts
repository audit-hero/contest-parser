import { LogLevel, Logger } from "jst-logger"
import { setPlaywrightConfig } from "../web-load/playwright-loader.js"
import { parseActiveCantinaContests } from "./cantinaParser.js"
import fs from "fs"
import playwright from "playwright"

Logger.setLevel(LogLevel.TRACE)

setPlaywrightConfig({
  wait: 1000,
  browser: await playwright.chromium.launch({ headless: true }) as any,
})

let res = await parseActiveCantinaContests([])

fs.writeFileSync("cantinaContests.json", JSON.stringify(res, null, 2))

process.exit(0)
