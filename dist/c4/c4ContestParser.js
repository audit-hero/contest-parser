import axios from "axios";
import log from "js-logger";
import { findDocUrl, findTags, getMdHeading } from "../util";
import Logger from "js-logger";
import { sentryError } from "ah-shared";
// 50 loc = 4 hours
// 1 loc = (3600*4)/50
export let secondsPerLoc = (3600 * 4) / 200;
export const parseActiveC4Contests = async (existingContests) => {
    let active = await getActiveC4Contests();
    let res = await Promise.all(parseC4Contests(active, existingContests));
    return res.filter(it => it !== undefined);
};
export const parseC4Contests = (contests, existingContests) => {
    let jobs = [];
    for (let i = 0; i < contests.length; ++i) {
        let contestExists = existingContests.find(it => it.pk === contests[i].trimmedSlug);
        if (contestExists && contestExists.modules.length > 0) {
            log.info(`contest ${contests[i].title} already exists, skipping`);
            continue;
        }
        let contest = parseC4Contest(contests[i])
            .then(it => {
            if (!it.ok)
                sentryError(it.error, `failed to parse c4 contest ${contests[i].title}`);
            else
                return it.value;
        })
            .catch(err => {
            sentryError(err, `error parsing c4 contest ${contests[i].title}`);
            return undefined;
        });
        jobs.push(contest);
    }
    return jobs;
};
export const getActiveC4Contests = async () => {
    let contests = await axios.get("https://code4rena.com/contests", { headers: { rsc: 1 } }).catch(e => {
        console.log(`error ${e}`);
        throw Error("can't fetch code4rena");
    }).then(it => {
        let contests = it.data.split(`contests\":`)[1].replace(`}]}]}]\n`, "");
        let contestsJson = JSON.parse(contests);
        return contestsJson;
    });
    let currentDate = Date.now();
    if (!contests)
        return [];
    let activeContests = contests.filter(it => {
        let endDate = new Date(it.end_time).getTime();
        return endDate > currentDate;
    });
    truncateLongNames(activeContests);
    return activeContests;
};
export const parseC4Contest = async (contest) => {
    log.info(`start parsing ${contest.title}`);
    let url = `https://code4rena.com/contests/${contest.slug}`;
    // try to get the raw README.md from either main or master branch
    // input: https://github.com/code-423n4/2022-09-quickswap
    let githubLink = contest.repo;
    let urlSplit = githubLink.split("/");
    let repo = urlSplit[urlSplit.length - 1];
    let org = urlSplit[urlSplit.length - 2];
    let branches = ["main", "master"];
    let readmeRaw;
    for (let branch of branches) {
        if (readmeRaw)
            break;
        let rawUrl = `https://raw.githubusercontent.com/${org}/${repo}/${branch}/README.md`;
        await axios.get(rawUrl).catch(e => {
            console.log(`Can't get repo ${rawUrl} (prolly private or upcoming) ${e}`);
        }).then(it => {
            readmeRaw = it?.data;
        });
    }
    // parse the md file
    let result = parseMd(url, readmeRaw, repo, contest);
    return result;
};
// sorted desc
const parseMd = (url, readme, repo, contest) => {
    // find lines that start with "|[src"
    let tags = [];
    let start_date = getTimestamp(contest.start_time), end_date = getTimestamp(contest.end_time);
    let modules = [];
    let docUrls = [];
    let hmAwards = contest.amount;
    if (readme) {
        let lines = readme.split("\n");
        let modulesResult = findModules(repo, lines, 0);
        modules = modulesResult.modules;
        docUrls = modulesResult.docUrls;
        hmAwards = getHmAwards(contest, lines);
        tags = findTags(lines);
    }
    else {
        console.log("Warning: Private contest");
    }
    let status = "active";
    if (start_date < Math.floor(Date.now() / 1000))
        status = "created";
    return {
        ok: true,
        value: {
            pk: contest.trimmedSlug,
            sk: "0",
            url: url,
            readme: readme ?? "",
            start_date: start_date,
            end_date: end_date,
            platform: "c4",
            active: 1,
            status: status,
            prize: hmAwards,
            auditTime: modules.map(it => it.auditTime).reduce((sum, it) => (sum ?? 0) + (it ?? 0), 0),
            loc: modules.map(it => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
            modules: modules,
            doc_urls: docUrls,
            repo_urls: [repo],
            tags: tags
        }
    };
};
const getHmAwards = (contest, lines) => {
    if (contest.hm_award_pool)
        return contest.hm_award_pool.toString();
    let hmAwards = contest.amount;
    let until = lines.length * 0.3;
    if (until < 10)
        until = lines.length;
    // modules
    for (let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        let trimmed = line.replace(/\\|\//g, "").toLowerCase();
        if (trimmed.includes("hm") || (trimmed.includes("high") && trimmed.includes("medium"))) {
            let awards = line.split(":")[1].trim();
            // check if award includes a number(with commas)
            let match = awards.match(/(\d{1,3},)*\d{1,3}/);
            if (match) {
                hmAwards = match[0].replace(/,/g, "");
                break;
            }
        }
    }
    return hmAwards;
};
const findModules = (repo, lines, moduleFindWay) => {
    let inScopeHeading = false;
    let docUrls = [];
    let modules = [];
    let referenceLinks = getLinkReferences(lines);
    let headings = [];
    // modules
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        getMdHeading(line, headings);
        let newDocs = findDocUrl(line, headings);
        if (newDocs.length > 0)
            docUrls = docUrls.concat(newDocs);
        if (!inScopeHeading) {
            if (line.toLowerCase().includes("scope"))
                inScopeHeading = true;
            continue;
        }
        if (line.toLowerCase().includes("not in scope") || line.toLowerCase().includes("out of scope")) {
            inScopeHeading = false;
        }
        if (inScopeHeading) {
            if (moduleFindWay == 0) {
                // latest one
                let module = findModuleFromTable(line, repo, referenceLinks);
                if (module)
                    modules.push(module);
            }
            else {
                let module = findModuleSloc(line, repo);
                if (module)
                    modules.push(module);
            }
        }
    }
    // try other standard
    if (modules.length == 0 && moduleFindWay < 1) {
        moduleFindWay++;
        findModules(repo, lines, moduleFindWay++);
    }
    docUrls = docUrls.filter((it, index) => docUrls.indexOf(it) === index);
    docUrls = docUrls.filter(it => !modules.find(module => module.url == it));
    return {
        modules: modules,
        docUrls: docUrls
    };
};
const findModuleSloc = (line, repo) => {
    let module = undefined;
    try {
        // let inculdesContracts = it.includes("contracts/")
        // let includesSrc = it.includes("src/")
        let lowerCaseLine = line.toLowerCase();
        let includesSloc = line.includes(".sol") && lowerCaseLine.includes("loc");
        if (includesSloc) {
            let lineSplit = line.split(".sol").map(it => it.trim());
            let name = lineSplit[0] + ".sol";
            let loc = parseInt(lineSplit[1].match(/\d+/)[0]);
            module = {
                name: name,
                path: name,
                url: "",
                loc: loc,
                contest: repo,
                active: 1,
                auditTime: loc * secondsPerLoc
            };
        }
    }
    catch (e) {
        console.log(`failed to parse line ${line}`);
    }
    return module;
};
const findModuleFromTable = (line, repo, referenceLinks) => {
    let module = undefined;
    try {
        let includesSolInTable = line.includes("|") && line.includes(".sol");
        if (includesSolInTable) {
            let lineSplit = line.split("|").map(it => it.trim());
            if (lineSplit.length < 2)
                return undefined;
            let url = "", path = "";
            for (let i = 0; i < lineSplit.length; ++i) {
                let pathAndUrl = lineSplit[i];
                let bySplit = getModulePathAndUrlBySplit(pathAndUrl);
                if (bySplit) {
                    url = bySplit.url;
                    path = bySplit.path;
                    break;
                }
                else {
                    let referenceLink = matchReferenceLink(pathAndUrl, referenceLinks);
                    if (referenceLink) {
                        url = referenceLink;
                        path = pathAndUrl;
                        break;
                    }
                }
            }
            path = path.replaceAll("`", "");
            let name = path.split("/").pop();
            let loc = 0;
            for (let i = 0; i < lineSplit.length; ++i) {
                let possibleLoc = parseInt(lineSplit[i]);
                if (possibleLoc) {
                    loc = possibleLoc;
                    break;
                }
            }
            if (!url.endsWith(".sol")) {
                Logger.info(`url does not end with .sol ${url}`);
                url = "";
                // one option would be to find this file from the repo
                // you can also just manually edit the item in ddb console
            }
            module = {
                name: name,
                path: path,
                url: url,
                loc: loc,
                contest: repo,
                active: 1,
                auditTime: loc * secondsPerLoc
            };
        }
    }
    catch (e) {
        console.log(`failed to parse line ${line}`);
    }
    return module;
};
const getModulePathAndUrlBySplit = (pathAndUrl) => {
    try {
        let path, url;
        let pathAndUrlSplit = pathAndUrl.split("](");
        path = pathAndUrlSplit[0].split("[")[1];
        url = pathAndUrlSplit[1].split(")")[0];
        if (url.endsWith("/"))
            url = url.substring(0, url.length - 1);
        return { path, url };
    }
    catch (e) {
        return undefined;
    }
};
const getLinkReferences = (content) => {
    // find [`LSP0ERC725AccountCore.sol`]: https://githu...tCore.sol
    // style links
    let regex = /^\[(.*)\]:\s*(.*)/g;
    let matches = content.reduce((acc, it) => {
        let match = it.match(regex);
        if (match)
            acc.push(match);
        return acc;
    }, []);
    let links = [];
    for (const matchArr of matches) {
        let match = matchArr[0];
        let split = match.split("]:");
        links.push({
            name: split[0].replace("[", "").trim(),
            url: split[1].trim()
        });
    }
    return links;
};
const matchReferenceLink = (line, links) => {
    let regex = /\[(.*)\]/g;
    let match = line.match(regex);
    if (match) {
        let name = match[0].replace("[", "").replace("]", "");
        let link = links.find(it => it.name === name);
        if (link)
            return link.url;
    }
};
const getTimestamp = (date) => {
    var someDate = new Date(date);
    return Math.floor(someDate.getTime() / 1000);
};
let truncateLongNames = (contests) => {
    // cohere table starts with `ah-00000000-3a7b-` 17 characters.
    // max length is 64, so 47 characters left
    let maxLength = 47;
    for (let contest of contests) {
        let trimmedSlug = contest.slug;
        if (trimmedSlug.length > maxLength) {
            trimmedSlug = contest.slug.slice(0, maxLength);
            for (let i = 1; i < 10; i++) {
                if (contest.slug[maxLength - 1 - i] == "-") {
                    trimmedSlug = contest.slug.slice(0, maxLength - 1 - i);
                    break;
                }
            }
        }
        contest.trimmedSlug = trimmedSlug;
    }
};
//# sourceMappingURL=c4ContestParser.js.map