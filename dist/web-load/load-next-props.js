import { Logger } from "jst-logger";
import { newPage } from "./playwright-loader.js";
export let loadNextProps = async (url) => {
    let page = await newPage();
    await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    let nextData = await page.evaluate(async () => {
        let props = JSON.parse(document.querySelector("#__NEXT_DATA__")?.textContent ?? "");
        return props;
    });
    return nextData.props.pageProps;
};
export let loadNuxtProps = async (url) => {
    Logger.debug(() => `loading ${url}`);
    let page = await newPage();
    await page.setExtraHTTPHeaders({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    });
    console.log("waiting for networkidle");
    await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });
    console.log("starting simulate");
    try {
        await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)));
        // Scroll the page to load additional content
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * Math.random()));
        setTimeout(async () => {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight * Math.random()));
        }, 200);
        console.log("moving and clicking");
        await page.mouse.move(530, 295);
        await page.mouse.click(530, 295);
        // wait for the main page to load
        await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 4000 + 5000)));
        // let DOMAfterSimulation = await page.evaluate(() => document.body.innerHTML)
        // save screenshot
        // await page.screenshot({ path: `./ign-screenshots/dom-after-simulation-${Date.now()}.png` })
        // console.log(`DOM after simulation: ${DOMAfterSimulation}`)
        // console.log("=================")
    }
    catch (error) {
        console.log(`No Cloudflare protection or already verified ${error}`);
        // let pageDom = await page.evaluate(() => document.body.innerHTML)
        // console.log(`DOM: ${pageDom}`)
        // await page.screenshot({ path: `./ign-screenshots/dom-after-error-${Date.now()}.png` })
    }
    let nuxtData = await page.evaluate(async () => {
        let nuxt = document.querySelector("#__NUXT_DATA__")?.textContent;
        let props = JSON.parse(nuxt ?? "{}");
        return props;
    });
    console.log(`nuxt data: ${JSON.stringify(nuxtData, null, 2)}`);
    return nuxtData;
};
//# sourceMappingURL=load-next-props.js.map