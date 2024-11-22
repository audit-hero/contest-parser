import { Logger } from "jst-logger"
import { newPage } from "./playwright-loader.js"

export let loadNextProps = async (url: string): Promise<any> => {
  let page = await newPage()

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  })

  let nextData = await page.evaluate(async () => {
    let props = JSON.parse(document.querySelector("#__NEXT_DATA__")?.textContent ?? "")
    return props
  })

  return nextData.props.pageProps
}

export let loadNuxtProps = async (url: string): Promise<any> => {
  Logger.debug(() => `loading ${url}`)
  let page = await newPage()
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  })

  console.log("waiting for networkidle")
  await page.goto(url, { waitUntil: "networkidle", timeout: 10_000 })

  console.log("starting simulate")

  // Check if Cloudflare protection is present
  try {
    // Add a random delay of 1 to 5 seconds to simulate human behavior
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)))

    // Scroll the page to load additional content
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * Math.random()))

    // Add another random delay of 1 to 5 seconds
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)))

    let DOMAfterSimulation = await page.evaluate(() => document.body.innerHTML)

    // save screenshot
    await page.screenshot({ path: `./screenshots/dom-after-simulation-${Date.now()}.png` })
    console.log(`DOM after simulation: ${DOMAfterSimulation}`)
    console.log("=================")

    // Wait for navigation after Cloudflare verification
    // You might need to adjust the selector based on the actual page content
    console.log("waiting for 5 seconds to load next page")
    // print DOM

    setTimeout(() => {}, 5_000)
  } catch (error) {
    console.log(`No Cloudflare protection or already verified ${error}`)

    let pageDom = await page.evaluate(() => document.body.innerHTML)
    console.log(`DOM: ${pageDom}`)
    await page.screenshot({ path: `./screenshots/dom-after-error-${Date.now()}.png` })
  }

  // Continue with your original code
  let nuxtData = await page.evaluate(async () => {
    let nuxt = document.querySelector("#__NUXT_DATA__")?.textContent
    // log out the DOM
    console.log(`nuxt DOM: ${document.body.innerHTML}`)
    let props = JSON.parse(nuxt ?? "{}")
    return props
  })

  console.log(`nuxt data: ${JSON.stringify(nuxtData, null, 2)}`)

  return parseNuxtData(nuxtData)
}

function parseNuxtData(data: any[]) {
  const result: any = {}

  function resolveValue(value: any): any {
    if (Array.isArray(value)) {
      if (value[0] === "ShallowReactive") {
        return resolveValue(value[1])
      }
      return value.map((item: any) => resolveValue(item))
    }
    if (typeof value === "object" && value !== null) {
      const resolved: any = {}
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = resolveValue(val)
      }
      return resolved
    }
    // If the value is a number and exists in the original data array
    if (typeof value === "number" && data[value] !== undefined) {
      return resolveValue(data[value])
    }
    return value
  }

  return resolveValue(data)
}
