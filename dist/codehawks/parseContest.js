import { NodeHtmlMarkdown } from "node-html-markdown";
import { findDocUrl, findTags, getAnyDateUTCTimestamp } from "../util.js";
import { parseTreeModulesV2 } from "../parse-modules.js";
import anyDate from "any-date-parser";
export const parseContest = async (contest) => {
    let md = await downloadContestAsMd(contest);
    return parseMd(contest, md);
};
let downloadContestAsMd = async (contest) => {
    let url = `https://www.codehawks.com/contests/${contest.id}`;
    let html = await fetch(url).then((it) => it.text());
    let md = NodeHtmlMarkdown.translate(html);
    return md;
};
export const parseMd = (mdContest, md) => {
    // remove header links
    let lines = md.split("MENU");
    if (lines.length === 1)
        lines = lines[0].split("\n");
    else
        lines = lines[1].split("\n");
    let active = mdContest.end_date > Math.floor(Date.now() / 1000) ? 1 : 0;
    let modules = findModules(mdContest.name, lines, active);
    let { start_date, end_date } = getStartEndDate(lines);
    if (start_date)
        mdContest = updateContestNameDate(mdContest, start_date);
    let contest = {
        pk: mdContest.name,
        readme: `# ${lines.join("\n")}`,
        start_date: start_date ?? mdContest.start_date,
        end_date: end_date ?? mdContest.end_date,
        platform: "codehawks",
        sk: "0",
        url: `https://www.codehawks.com/contests/${mdContest.id}`,
        active: active,
        status: mdStatusToStatus(mdContest.status),
        modules: modules,
        doc_urls: findDocUrls(lines),
        prize: mdContest.prize,
        tags: findTags(lines),
    };
    return contest;
};
let updateContestNameDate = (contest, start_date) => {
    let startYear = new Date(start_date * 1000).getFullYear();
    let startMonth = new Date(start_date * 1000).getMonth() + 1;
    contest.name = `${startYear}-${startMonth
        .toString()
        .padStart(2, "0")}-${contest.name.split("-").slice(2).join("-")}`;
    return contest;
};
let mdStatusToStatus = (status) => {
    switch (status) {
        case "live":
            return "active";
        case "appeal review":
            return "judging";
        case "appeal period":
            return "judging";
        case "judging period":
            return "judging";
        case "completed":
            return "finished";
        case "unknown":
            throw new Error(`Unknown status: ${status}`);
    }
};
let getModulesStartIndex = (lines) => {
    let modulesStart = lines.findIndex((it) => it.includes("# ") &&
        it.toLowerCase().includes("scope") &&
        !it.toLowerCase().includes("out of scope"));
    if (modulesStart === -1) {
        modulesStart = lines.findIndex((it) => it.includes("# ") && it.toLowerCase().includes(" contracts"));
    }
    return modulesStart;
};
const findModules = (contest, lines, active) => {
    let modulesStart = getModulesStartIndex(lines);
    let modulesEnd = lines.findIndex((it, index) => {
        return (index > modulesStart &&
            ((it.includes("# ") && it.toLowerCase().includes("out of scope")) ||
                (it.includes("# ") && it.toLowerCase().includes("summary")) ||
                it.match(/^#{1,4} /)));
    });
    if (modulesEnd === -1)
        modulesEnd = lines.length;
    if (modulesStart === -1)
        return [];
    modulesStart += 1;
    let modules = [];
    let scope = lines.slice(modulesStart, modulesEnd).join("\n");
    let repos = (scope.match(/https:\/\/github.com\/[^/]+\/[^/>]+/g) ?? []).map((it) => {
        if (it.includes("tree"))
            return it;
        return it + "/tree/main";
    });
    if (repos.length === 0) {
        addMainRepo(lines, repos);
    }
    const regex = /```[\s\S]*?```/g;
    const blocks = scope.match(regex);
    let blockModules = blocks?.map((block) => parseTreeModulesV2(block.split("\n"))) ?? [];
    if (repos.length < blockModules.length) {
        // fill repos until moduleStrings.length
        let reposLength = repos.length;
        let diff = blockModules.length - reposLength;
        for (let i = 0; i < diff; ++i) {
            repos.push(repos[reposLength - 1]);
        }
    }
    for (let i = 0; i < blockModules.length; ++i) {
        let moduleStrings = blockModules[i];
        let repo = repos[i];
        for (let path of moduleStrings) {
            let module = {
                name: path.split("/").pop(),
                contest,
                active,
                path,
                url: `${repo}/${path}`,
            };
            modules.push(module);
        }
    }
    return modules;
};
const findDocUrls = (lines) => {
    let docUrls = [];
    let docLinesEnd = lines.findIndex((it) => it.startsWith("## Scope"));
    for (let i = 0; i < docLinesEnd; ++i) {
        let line = lines[i];
        let newUrls = findDocUrl(line, ["about"]);
        docUrls.push(...newUrls);
    }
    return docUrls;
};
let getStartEndDate = (lines) => {
    let start_date = 0;
    let end_date = 0;
    for (let line of lines) {
        if (start_date && end_date)
            break;
        let startDate = line.match(/Start Date /);
        if (startDate) {
            let date = anyDate.attempt(line.replace("Start Date ", "").replaceAll(/(\(|\))/g, ""));
            if (date.invalid)
                continue;
            start_date = getAnyDateUTCTimestamp(date);
            continue;
        }
        let endDate = line.match(/End Date /);
        if (endDate) {
            let date = anyDate.attempt(line.replace("End Date ", "").replaceAll(/(\(|\))/g, ""));
            if (date.invalid)
                continue;
            end_date = getAnyDateUTCTimestamp(date);
            continue;
        }
    }
    return { start_date, end_date };
};
function addMainRepo(lines, repos) {
    let mainRepo = "";
    for (let line of lines) {
        let repo = line.match(/https:\/\/github.com\/[^/]+\/[^/>\)]+/g);
        if (repo) {
            mainRepo = repo[0];
            break;
        }
    }
    if (mainRepo) {
        if (!mainRepo.includes("tree"))
            mainRepo += "/tree/main";
        repos.push(mainRepo);
    }
}
//# sourceMappingURL=parseContest.js.map