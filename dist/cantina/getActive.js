import { NodeHtmlMarkdown } from "node-html-markdown";
import { getAnyDateTimestamp, truncateLongContestName } from "../util.js";
import anyDate from "any-date-parser";
export const getActiveCantinaContests = async () => {
    let md = await getHtmlAsMd();
    return getActiveContests(md);
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
    let start_date = getAnyDateTimestamp(anyDate.attempt(dateLine.split(" - ")[0]));
    let end_date = getAnyDateTimestamp(anyDate.attempt(dateLine.split(" - ")[1]));
    return { start_date, end_date };
};
const getHtmlAsMd = async () => {
    let contests = await fetch("https://cantina.xyz/competitions")
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