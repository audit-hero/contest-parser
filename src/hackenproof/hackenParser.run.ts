import { LogLevel, Logger } from "jst-logger"
import { setPlaywrightConfig } from "../web-load/playwright-loader.js"
import { parseActiveHackenContests } from "./hackenParser.js"
import fs from "fs"
import playwright from "playwright"
import { chromium } from 'playwright-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

chromium.use(StealthPlugin())
// chromium.plugins.setDependencyDefaults('stealth/evasions/webgl.vendor', {
//   vendor: 'dftjcu3',
//   renderer: 'p4vuhnd'
// })

Logger.setLevel(LogLevel.TRACE)

setPlaywrightConfig({
  wait: 1000,
  browser: (await chromium.launch({ headless: true })) as any,
})

// await chromium.launch({ headless: true }).then(async browser => {
//   const page = await browser.newPage()

//   console.log('Testing the webgl spoofing feature of the stealth plugin..')
//   await page.goto('https://webglreport.com', { waitUntil: 'networkidle' })
//   await page.screenshot({ path: 'webgl.png', fullPage: true })

//   console.log('All done, check the screenshot. ✨')
//   await browser.close()
// })


let res = await parseActiveHackenContests([])
fs.writeFileSync("hackenContests.json", JSON.stringify(res, null, 2))

process.exit(0)
