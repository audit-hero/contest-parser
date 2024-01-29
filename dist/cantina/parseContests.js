import { getAnyDateTimestamp, truncateLongContestName } from "../util.js";
import anyDate from "any-date-parser";
import { statuses } from "./types.js";
export const parseMd = (md) => {
    let lines = md.split("\n");
    let results = [];
    let name = "";
    let status = "unknown";
    for (let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        let lineStatus = getStatus(line);
        if (lineStatus)
            status = lineStatus;
        if (name === "" && line.match(/^#{1,3} /)) {
            name = truncateLongContestName(line
                .replace(/^#{1,3} /, "")
                .toLowerCase()
                .replace(/ /g, "-")
                .replace("\\", "")
                .replace(/-{1,4}/, "-"));
        }
        if (name !== "" && line.startsWith("[View competition](")) {
            let id = line
                .replace("[View competition](/competitions/", "")
                .replace(")", "");
            let dateLine = lines[i - 2];
            let { start_date, end_date } = getStartEndDate(dateLine);
            let prize = lines[i - 4];
            // let startDate = new Date(start_date * 1000)
            let startYear = new Date(start_date * 1000).getFullYear();
            let startMonth = new Date(start_date * 1000).getMonth() + 1;
            name = `${startYear}-${startMonth
                .toString()
                .padStart(2, "0")}-${name.replace("-competition", "")}`;
            results.push({ name, id, start_date, end_date, prize, status });
            name = "";
            status = "unknown";
        }
    }
    return results;
};
let getStatus = (line) => {
    line = line.trim().toLowerCase().replace(/^#{1,3} /, "");
    let isSingleWordLine = line.match(/^[a-zA-Z]+$/);
    let isStatusLine = isSingleWordLine &&
        statuses.some((it) => it.match(new RegExp(`^${line.trim()}$`)));
    let status;
    if (isStatusLine) {
        status = line.trim();
    }
    return status;
};
const getStartEndDate = (dateLine) => {
    let start_date = getAnyDateTimestamp(anyDate.attempt(dateLine.split(" - ")[0]));
    let end_date = getAnyDateTimestamp(anyDate.attempt(dateLine.split(" - ")[1]));
    return { start_date, end_date };
};
//# sourceMappingURL=parseContests.js.map