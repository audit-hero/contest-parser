import { statuses } from "./types.js";
export const parseMd = (md) => {
    let boosts = md.split(/\n#{1,6}.*Boost/)[1].split(/\n#{1,3} /)[0];
    let lines = boosts.split("\n");
    let results = [];
    let status = "unknown";
    for (let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        let lineStatus = getStatus(line);
        if (lineStatus)
            status = lineStatus;
        if (line.startsWith("[View boost](") ||
            line.startsWith("[View results](")) {
            let id;
            if (line.startsWith("[View boost](")) {
                id = line.replace("[View boost](/bounty/", "").replace("/)", "");
            }
            else {
                id = line.replace("[View results](/bounty/", "").replace("/)", "");
            }
            let prize = lines[i - 4].trim();
            let name = id;
            results.push({ name, id, prize, status });
            status = "unknown";
        }
    }
    return results;
};
let getStatus = (line) => {
    line = line
        .trim()
        .toLowerCase()
        .replace(/^#{1,3} /, "");
    // let isSingleWordLine = line.match(/^[a-zA-Z]+$/)
    let regexpEscaped = line.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let isStatusLine = 
    // isSingleWordLine &&
    statuses.some((it) => it.match(new RegExp(`^${regexpEscaped}$`)));
    let status;
    if (isStatusLine) {
        status = line.trim();
    }
    return status;
};
//# sourceMappingURL=parseContests.js.map