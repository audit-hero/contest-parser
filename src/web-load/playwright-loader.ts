import chalk from "chalk"
import { Browser, BrowserContext, Page, chromium } from "playwright-core"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { contentTooShort, isNotFoundPage, loading } from "./verifyPage.js"
import { Logger } from "jst-logger"

// set the browser via setPlaywrightConfig

let config: Config

export type Config = {
  wait: number
  browser: Browser
}

export let setPlaywrightConfig = (config_: Partial<Config>) => {
  config = { ...config, ...config_ }
}

export type ScrapeResult = {
  content: string
  title: string
  url: string
}

export const closeBrowser = () => {
  config.browser.close()
}

let lastLogTime = 0
let activeCount = 0

// remember to close the page when done. but not browser
export let newPage = async () => {
  const context = await config.browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    viewport: {
      width: 1920,
      height: 1080,
    },
    extraHTTPHeaders: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
    },
  })

  const page = await context.newPage()

  // let page = await config.browser.newPage()
  return page
}

export let scrape = async (
  url: string,
  loadingPhrases: string[] = ["Loading.."],
): Promise<ScrapeResult> => {
  // return from the server, but run evaluate again until have some content
  console.log(chalk.green(`Scraping ${url}...`))

  let page = await config.browser.newPage()

  let consoleLog = ""
  page.on("console", (msg) => {
    consoleLog += msg.text()
  })

  if (activeCount > 25) {
    console.log(chalk.magenta(`waiting...`))
    while (activeCount > 25) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  activeCount++
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 })

  let { content, title, startTime } = await waitForPageToLoad(page, loadingPhrases, config.wait)

  if (contentTooShort(content) || isNotFoundPage(content, title)) {
    Logger.error(chalk.red(`Failed to scrape ${url} after ${Date.now() - startTime}ms`))
    return { content: "", title: "", url: url }
  }

  Logger.debug(`Scraped ${content.slice(0, 100)}...`)
  Logger.trace(`Console: ${consoleLog}`)
  Logger.trace(`Scraped: ${content}`)

  activeCount--
  return { content, title, url }
}

export async function waitForPageToLoad(page: Page, loadingPhrases: string[], wait?: number) {
  let startTime = Date.now()
  let content = "",
    title = "",
    htmlContent = ""

  if (wait && wait > 0) console.log(chalk.magenta(`waiting ${wait}ms...`))

  // wait max 150 for some meaningful content to load
  while (
    (contentTooShort(content) ||
      isNotFoundPage(content, title) ||
      loading(content, loadingPhrases) ||
      (wait && Date.now() - startTime < wait)) &&
    Date.now() - startTime < 150000
  ) {
    new Promise((resolve) => setTimeout(resolve, 500))

    htmlContent = await page.evaluate(async () => {
      let body = document.body?.innerHTML ?? ""
      return body
    })

    content = NodeHtmlMarkdown.translate(htmlContent)
    title = await page.title()

    if (Date.now() - lastLogTime > 10000) {
      if (contentTooShort(content))
        console.log(chalk.yellow(`Content too short: ${chalk.white(content)}`))
      if (isNotFoundPage(content, title))
        console.log(chalk.yellow(`Page not found: ${chalk.white(content)} ${chalk.white(title)})}`))
      lastLogTime = Date.now()
    }
  }

  lastLogTime = 0
  activeCount = 0

  Logger.debug(`Scraped ${content}`)
  return { content, title, startTime }
}
