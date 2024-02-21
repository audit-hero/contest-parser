import { chromium } from "playwright";
import { getAnyDateUTCTimestamp, truncateLongContestName } from "../../util.js";
import anyDate from "any-date-parser";
import { waitForPageToLoad } from "../../web-load/playwright-loader.js";
export const getActive = async () => {
    let contestUrls = await getContestUrls();
    // return getActiveContests(md)
    return [];
};
let _browser = undefined;
const browser = async () => {
    if (_browser)
        return _browser;
    _browser = await chromium.launch({ headless: true });
    return _browser;
};
export const getContestUrls = async (loadingPhrases = ["Loading.."]) => {
    let page = await (await browser()).newPage();
    await page.goto("https://app.hats.finance/bug-bounties", {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    let { content, title, startTime } = await waitForPageToLoad(page, loadingPhrases);
    let urls = await page.evaluate(async () => {
        // press on button "Competition details"
        let urls = [];
        let buttons = document.querySelectorAll("button");
        for (let i = 0; i < buttons.length; ++i) {
            let button = buttons[i];
            if (button.textContent === "Competition details") {
                button.click();
                await new Promise((resolve) => setTimeout(resolve, 1000));
                urls.push(window.location.href);
                history.back();
            }
        }
        return urls;
    });
    return urls;
};
export const getActiveContests = (md) => {
    let lines = md.split("\n");
    let results = [];
    let name = "";
    for (let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        if (line.startsWith("# ")) {
            name = truncateLongContestName(line.replace("# ", "").toLowerCase().replace(/ /g, "-"));
        }
        if (name !== "" && line.startsWith("[View competition](")) {
            let id = line
                .replace("[View competition](/competitions/", "")
                .replace(")", "");
            let dateLine = lines[i - 2];
            let { start_date, end_date } = getStartEndDate(dateLine);
            let prize = lines[i - 4];
            results.push({ name, id, start_date, end_date, prize });
            name = "";
        }
    }
    return results;
};
const getStartEndDate = (dateLine) => {
    let start_date = getAnyDateUTCTimestamp(anyDate.attempt(dateLine.split(" - ")[0]));
    let end_date = getAnyDateUTCTimestamp(anyDate.attempt(dateLine.split(" - ")[1]));
    return { start_date, end_date };
};
//# sourceMappingURL=getActive.js.map