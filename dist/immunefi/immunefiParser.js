import { parseContest } from "./parseContest.js";
import { scrape } from "../web-load/playwright-loader.js";
import { isActive, toId } from "./types.js";
import { loadNextProps } from "../web-load/load-next-props.js";
let listUrl = "https://immunefi.com/boost/";
// this returns all from the cantina web site
export const parseActiveImmunefiContests = async (existingContests) => {
    let active = await getActiveContests();
    active = active.filter((it) => {
        let existing = existingContests.find((existing) => existing.pk === toId(it));
        return !existing || existing.modules?.length === 0;
    });
    let contests = await Promise.all(active.map((it) => parseContest(it)));
    return contests;
};
export const getAllContests = async () => (await loadNextProps("https://immunefi.com/boost/")).bounties;
export const getActiveContests = async () => {
    let allContests = await getAllContests();
    return allContests.filter(isActive);
};
const getHtmlAsMd = async () => {
    return (await scrape(listUrl, [])).content;
};
//# sourceMappingURL=immunefiParser.js.map