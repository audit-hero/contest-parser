import { Logger } from "jst-logger";
export let moduleExtensions = [".sol", ".go", ".rs", "cairo"];
let ignoreLinkWords = ["report", "twitter", "discord", "security-review"];
export let docHeadings = ["about", "overview", "resources", "q&a", "additional context", "links"];
export let ignoredScopeFiles = [
    "test",
    "mock",
    "script",
    ".s.sol",
    ".t.sol",
    "forge-std",
    "hardhat",
];
let ignoreContestNames = ["servet test"];
export let isIgnoredContestName = (name) => ignoreContestNames.some((it) => name.toLocaleLowerCase().includes(it));
export const getContestStatus = (dates) => {
    let now = Date.now() / 1000;
    if (now < dates.startDate)
        return "created";
    else if (now > dates.endDate)
        return "finished";
    else
        return "active";
};
export let trimContestName = (name, startDate) => pipe(replaceNonTextCharacters(name), addYearAndMonthToContestName(startDate), toLowerCase, truncateLongContestName);
export let addYearAndMonthToContestName = (startDate) => (name) => {
    if (name.match(/^\d{4}-\d{2}-/))
        return name;
    let startYear = new Date(startDate * 1000).getFullYear();
    let startMonth = new Date(startDate * 1000).getMonth() + 1;
    return `${startYear}-${startMonth.toString().padStart(2, "0")}-${name}`;
};
export let replaceNonTextCharacters = (contestName) => {
    return contestName
        .replace(/[^a-zA-Z0-9-]/g, "") // replace all non-alphanumeric characters with ""
        .replace(/-{2,4}/g, "-"); // replace all multiple dashes with single dash
};
export const getMdHeading = (line, headings) => {
    let pattern = /^(#{1,6})\s+(.+)$/g;
    let match = pattern.exec(line);
    if (match?.length ?? 0 > 0) {
        let newHeading = match[0];
        let headingLevel = newHeading.match(/#/g).length;
        let existingHeading = headings.findIndex((it) => it.match(/#/g).length === headingLevel);
        if (existingHeading > -1) {
            // replace the heading and all of headings below it
            headings.splice(existingHeading);
            headings.push(newHeading);
        }
        else
            headings.push(newHeading);
        return newHeading;
    }
};
export const findDocUrl = (line, headings) => {
    if (!docHeadings.some((docHeadings) => headings.some((heading) => heading.toLowerCase().includes(docHeadings))))
        return [];
    const pattern = /\bhttps?:\/\/\S+\b/g;
    let urls = line.match(pattern);
    let docs = [];
    if (urls?.length ?? 0 > 0) {
        for (let i = 0; i < urls.length; ++i) {
            let url = urls[i];
            if (ignoreLinkWords.some((it) => url.toLowerCase().includes(it)))
                continue;
            docs.push(url);
        }
    }
    return docs;
};
export const findTags = (lines) => {
    let tags = [];
    for (let line of lines) {
        // find tags
        ALL_TAGS.forEach((tag, index) => {
            if (index > 0) {
                if (line.toLowerCase().includes(tag)) {
                    tags.push(tag);
                }
            }
        });
    }
    return tags.filter((it, index) => tags.indexOf(it) === index);
};
export let githubUrlToRawUrl = (url) => url.replace("github.com", "raw.githubusercontent.com");
export const getReadmeFromGithub = async (user, repo) => {
    let baseUrl = `https://raw.githubusercontent.com/${user}/${repo}/main`;
    let readme = await fetch(`${baseUrl}/README.md`)
        .catch((e) => {
        return undefined;
    })
        .then((it) => {
        return it?.text();
    });
    if (readme)
        return {
            readme,
            baseUrl
        };
    baseUrl = `https://raw.githubusercontent.com/${user}/${repo}/master`;
    readme = await fetch(`${baseUrl}/README.md`)
        .catch((e) => {
        return undefined;
    })
        .then((it) => {
        return it?.text();
    });
    if (readme)
        return { readme, baseUrl };
    Logger.info(`no readme found for ${user}/${repo}`);
    return undefined;
};
export const getAllRepos = async (org) => {
    var reposLength = 100;
    var reposBuilder = [];
    var page = 1;
    while (reposLength == 100) {
        let repos = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`, githubParams)
            .then(async (it) => {
            let text = await it.text();
            return JSON.parse(text);
        })
            .catch((e) => {
            Logger.error(`get repos error: ${e}`);
            throw e;
        });
        reposBuilder = reposBuilder.concat(repos);
        reposLength = repos.length;
        page++;
    }
    return reposBuilder;
};
const getPushTimestamp = (timestamp) => Math.floor(new Date(timestamp).getTime() / 1000);
export const getRepoNameFromUrl = (url) => {
    let split = url.split("/");
    if (split[split.length - 1] === "")
        split.pop();
    return split[split.length - 1];
};
import { githubParams } from "./config.js";
import { ALL_TAGS } from "ah-shared";
import { pipe } from "fp-ts/lib/function.js";
import { toLowerCase } from "fp-ts/lib/string.js";
import { NodeHtmlMarkdown } from "node-html-markdown";
export let workingDir = () => {
    let workingDir = `/${import.meta.url.split("/").slice(3, -2).join("/")}`;
    return workingDir;
};
export const logTrace = (msg) => {
    Logger.trace(msg());
};
export let truncateLongContestName = (name) => {
    // cohere table starts with `ah-00000000-3a7b-` 17 characters.
    // max length is 64, so 47 characters left
    let maxLength = 47;
    let trimmedSlug = name;
    if (trimmedSlug.length > maxLength) {
        trimmedSlug = name.slice(0, maxLength);
        for (let i = 1; i < 10; i++) {
            if (name[maxLength - 1 - i] == "-") {
                trimmedSlug = name.slice(0, maxLength - 1 - i);
                break;
            }
        }
    }
    return trimmedSlug;
};
import anyDateParser from "any-date-parser";
export const getAnyDateUTCTimestamp = (someStringDate) => {
    try {
        let anyDate = anyDateParser.attempt(someStringDate);
        // August 21, 2023
        if (anyDate.year === undefined)
            anyDate.year = new Date().getFullYear();
        if (anyDate.month === undefined || anyDate.day === undefined)
            throw new Error("invalid anydate");
        var someDate = Date.UTC(anyDate.year, anyDate.month - 1, anyDate.day, anyDate.hour ?? 0, anyDate.minute ?? 0, anyDate.second ?? 0);
        return someDate / 1000;
    }
    catch (e) {
        let jsTimestamp = getJsDateTimestamp(someStringDate);
        if (!jsTimestamp) {
            Logger.error(`error cannot get timesetamp ${someStringDate} ${e}`);
        }
        return jsTimestamp;
    }
};
export const getJsDateTimestamp = (someStringDate) => {
    let date = new Date(someStringDate);
    let currentYear = new Date().getFullYear();
    // if year more than 1 away
    if (Math.abs(date.getFullYear() - currentYear) > 1) {
        date = new Date(date.setFullYear(currentYear));
    }
    return date.getTime() / 1000;
};
export let getHtmlAsMd = async (url) => {
    let contests = await fetch(url)
        .then((it) => {
        return it.text();
    })
        .catch((e) => {
        console.log(`error ${e}`);
        throw Error("can't get html as md");
    });
    let parsed = NodeHtmlMarkdown.translate(contests);
    return parsed;
};
//# sourceMappingURL=util.js.map