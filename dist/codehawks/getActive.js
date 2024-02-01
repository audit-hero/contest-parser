import { NodeHtmlMarkdown } from "node-html-markdown";
import { parseMd } from "./parseContests.js";
export const getAllContests = async () => {
    let md = await getHtmlAsMd();
    return parseMd(md);
};
export const getActiveContests = async () => {
    let allContests = await getAllContests();
    let epochSeconds = Math.floor(Date.now() / 1000);
    return allContests.filter((it) => {
        return it.start_date <= epochSeconds && it.end_date >= epochSeconds;
    });
};
const getHtmlAsMd = async () => {
    let contests = await fetch("https://www.codehawks.com/contests")
        .then((it) => {
        return it.text();
    })
        .catch((e) => {
        console.log(`error ${e}`);
        throw Error("can't fetch cantina contests");
    });
    let parsed = NodeHtmlMarkdown.translate(contests);
    return parsed;
};
//# sourceMappingURL=getActive.js.map