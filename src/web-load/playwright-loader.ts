import chalk from "chalk"
import { Browser, Page } from "playwright"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { contentTooShort, isNotFoundPage, loading } from "./verifyPage.js"
import { chromium } from "playwright"

let _browser: Browser | undefined = undefined
const browser = async () => {
  if (_browser) return _browser
  _browser = await chromium.launch({ headless: true })
  return _browser
}

export let overridePlaywrightBrowser = (b: () => Browser) => {
  _browser = b()
}

export type ScrapeResult = {
  content: string
  title: string
  url: string
}

export const closeBrowser = () => {
  if (_browser) _browser.close()
}

let lastLogTime = 0
let activeCount = 0

export let scrape = async (
  url: string,
  loadingPhrases: string[] = ["Loading.."],
  wait?: number
): Promise<ScrapeResult> => {
  // return from the server, but run evaluate again until have some content
  console.log(chalk.green(`Scraping ${url}...`))

  let page = await (await browser()).newPage()

  if (activeCount > 25) {
    console.log(chalk.magenta(`waiting...`))
    while (activeCount > 25) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  activeCount++
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 })

  let { content, title, startTime } = await waitForPageToLoad(
    page,
    loadingPhrases,
    wait
  )

  if (contentTooShort(content) || isNotFoundPage(content, title)) {
    console.log(
      chalk.red(`Failed to scrape ${url} after ${Date.now() - startTime}ms`)
    )
    return { content: "", title: "", url: url }
  }

  activeCount--
  return { content, title, url }
}

export async function waitForPageToLoad(
  page: Page,
  loadingPhrases: string[],
  wait?: number
) {
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
        console.log(
          chalk.yellow(
            `Page not found: ${chalk.white(content)} ${chalk.white(title)})}`
          )
        )
      lastLogTime = Date.now()
    }
  }
  return { content, title, startTime }
}
