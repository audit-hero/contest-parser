import chalk from "chalk";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { contentTooShort, isNotFoundPage, loading } from "./verifyPage.js";
import { chromium } from "playwright";
let _browser = undefined;
let config = {
    wait: 100,
    browser: async () => {
        if (_browser)
            return _browser;
        let browser = await chromium.launch({ headless: true });
        return await browser.newContext();
    },
};
export let setPlaywrightConfig = (config_) => {
    config = { ...config, ...config_ };
};
export const closeBrowser = () => {
    if (_browser)
        _browser.close();
};
let lastLogTime = 0;
let activeCount = 0;
export let scrape = async (url, loadingPhrases = ["Loading.."]) => {
    // return from the server, but run evaluate again until have some content
    console.log(chalk.green(`Scraping ${url}...`));
    let page = await (await config.browser()).newPage();
    if (activeCount > 25) {
        console.log(chalk.magenta(`waiting...`));
        while (activeCount > 25) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    activeCount++;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    let { content, title, startTime } = await waitForPageToLoad(page, loadingPhrases, config.wait);
    if (contentTooShort(content) || isNotFoundPage(content, title)) {
        console.log(chalk.red(`Failed to scrape ${url} after ${Date.now() - startTime}ms`));
        return { content: "", title: "", url: url };
    }
    activeCount--;
    return { content, title, url };
};
export async function waitForPageToLoad(page, loadingPhrases, wait) {
    let startTime = Date.now();
    let content = "", title = "", htmlContent = "";
    if (wait && wait > 0)
        console.log(chalk.magenta(`waiting ${wait}ms...`));
    // wait max 150 for some meaningful content to load
    while ((contentTooShort(content) ||
        isNotFoundPage(content, title) ||
        loading(content, loadingPhrases) ||
        (wait && Date.now() - startTime < wait)) &&
        Date.now() - startTime < 150000) {
        new Promise((resolve) => setTimeout(resolve, 500));
        htmlContent = await page.evaluate(async () => {
            let body = document.body?.innerHTML ?? "";
            return body;
        });
        content = NodeHtmlMarkdown.translate(htmlContent);
        title = await page.title();
        if (Date.now() - lastLogTime > 10000) {
            if (contentTooShort(content))
                console.log(chalk.yellow(`Content too short: ${chalk.white(content)}`));
            if (isNotFoundPage(content, title))
                console.log(chalk.yellow(`Page not found: ${chalk.white(content)} ${chalk.white(title)})}`));
            lastLogTime = Date.now();
        }
    }
    return { content, title, startTime };
}
//# sourceMappingURL=playwright-loader.js.map