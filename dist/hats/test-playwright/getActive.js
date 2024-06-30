import { getAnyDateUTCTimestamp, truncateLongContestName } from "../../util.js";
import { newPage, waitForPageToLoad } from "../../web-load/playwright-loader.js";
export const getActive = async () => {
    let contestUrls = await getContestUrls();
    // return getActiveContests(md)
    return [];
};
export const getContestUrls = async (loadingPhrases = ["Loading.."]) => {
    let page = await newPage();
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
    page.close();
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
    let start_date = getAnyDateUTCTimestamp(dateLine.split(" - ")[0]);
    let end_date = getAnyDateUTCTimestamp(dateLine.split(" - ")[1]);
    if (!start_date || !end_date) {
        throw new Error(`Could not parse start and end date from ${dateLine}`);
    }
    return { start_date, end_date };
};
//# sourceMappingURL=getActive.js.map