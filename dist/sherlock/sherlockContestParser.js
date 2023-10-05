import axios from "axios";
import Logger from "js-logger";
import { secondsPerLoc } from "../c4/c4ContestParser.js";
import { sentryError } from "ah-shared";
import { getRepoNameFromUrl, getMdHeading, findDocUrl, findTags } from "../util";
let sherlockContestsUrl = "https://mainnet-contest.sherlock.xyz/contests";
export const parseActiveSherlockContests = async (existingContests) => {
    let active = await getActiveSherlockContests();
    let res = await Promise.all(parseSherlockContests(active, existingContests));
    return res.filter(it => it !== undefined);
};
export const parseSherlockContests = (contests, existingContests) => {
    let jobs = [];
    for (let i = 0; i < contests.length; ++i) {
        let contestExists = existingContests.find(it => it.pk === getRepoNameFromUrl(contests[i].template_repo_name));
        if (contestExists && contestExists.modules.length > 0) {
            Logger.info(`contest ${contests[i].title} already exists, skipping`);
            continue;
        }
        else {
            if (contests[i].ends_at < (Date.now() / 1000)) {
                Logger.info(`contest ${contests[i].title} has already ended, skipping`);
                continue;
            }
            Logger.info(`contest ${contests[i].title} doesn't exist, parsing`);
        }
        let contest = parseSherlockContest(contests[i])
            .then(it => {
            if (!it.ok) {
                sentryError(it.error, `failed to parse sherlock contest ${contests[i].title}`, "daily");
            }
            else {
                return it.value;
            }
        }).catch(e => {
            sentryError(e, `failed to parse sherlock contest ${contests[i].title}`, "daily");
            return undefined;
        });
        jobs.push(contest);
    }
    return jobs;
};
export const getActiveSherlockContests = async () => {
    // get 2 pages
    let builder = [];
    for (let i = 0; i < 2; ++i) {
        let url = `${sherlockContestsUrl}?page=${i + 1}`;
        let contests = await axios.get(url).then(it => {
            return it.data.items;
        }).catch(e => {
            console.log(`error ${e}`);
            sentryError(e, "failed to fetch sherlock contests");
            return [];
        });
        builder = builder.concat(contests);
    }
    return builder.filter(it => it.status !== "FINISHED");
};
const getReadmeFromGithub = async (contest) => {
    let baseUrl = `https://raw.githubusercontent.com/sherlock-audit/${contest}/main`;
    let readme = await axios.get(`${baseUrl}/README.md`).catch((e) => {
        return undefined;
    }).then(it => {
        return it?.data;
    });
    if (readme)
        return {
            main: readme,
            baseUrl: baseUrl
        };
    baseUrl = `https://raw.githubusercontent.com/sherlock-audit/${contest}/master`;
    readme = await axios.get(`${baseUrl}/README.md`).catch((e) => {
        return undefined;
    }).then(it => {
        return it?.data;
    });
    if (readme)
        return { master: readme, baseUrl: baseUrl };
    Logger.info(`no readme found for ${contest}`);
    return undefined;
};
export const parseSherlockContest = async (contest) => {
    // let githubLink = contest.repo
    let jsonUrl = `${sherlockContestsUrl}/${contest.id}`;
    let contestDetails = await axios.get(jsonUrl, { headers: { "Content-Type": "application/json" } }).catch(e => {
        console.log(`error ${e}`);
        return undefined;
    }).then(it => {
        return it?.data;
    });
    let name = getRepoName(contestDetails);
    let readmeObj = await getReadmeFromGithub(name);
    let nonParsedDetails = {
        pk: name,
        sk: "0",
        url: `https://app.sherlock.xyz/audits/contests/${contest.id}`,
        start_date: contest.starts_at,
        end_date: contest.ends_at,
        platform: "sherlock",
        active: 1,
        status: sherlockStatusToStatus(contest.status),
        prize: `${contest.prize_pool}$`,
    };
    if (!readmeObj) {
        let now = Math.floor(Date.now() / 1000);
        if (contest.starts_at < now) {
            return {
                ok: false,
                error: `no readme found for ${contest}`
            };
        }
        else {
            return {
                ok: true,
                value: {
                    ...nonParsedDetails,
                    modules: [],
                    tags: []
                }
            };
        }
    }
    let readme;
    if (readmeObj.main)
        readme = readmeObj.main;
    else
        readme = readmeObj.master;
    let modules = [];
    let repos = [];
    let tags = [];
    let docUrls = [];
    if (readme) {
        let lines = readme.split("\n");
        const findModules = () => {
            let afterInScope = false;
            let headings = [];
            // modules
            for (let line of lines) {
                getMdHeading(line, headings);
                if (!afterInScope) {
                    let newDocs = findDocUrl(line, headings);
                    if (newDocs.length > 0)
                        docUrls = docUrls.concat(newDocs);
                    if (line.toLowerCase().includes("scope") &&
                        line.toLowerCase().includes("# "))
                        afterInScope = true;
                    continue;
                }
                if (line.toLowerCase().includes("not in scope") || line.toLowerCase().includes("out of scope") || line.startsWith("#")) {
                    afterInScope = false;
                }
                if (afterInScope) {
                    let module = findModuleSloc(line, contest, name, repos, readmeObj.baseUrl);
                    if (module.module)
                        modules.push(module.module);
                    if (module.repo)
                        repos.push(module.repo);
                }
            }
        };
        findModules();
        tags = findTags(lines);
    }
    if (modules.length === 0)
        sentryError(`no modules found for ${name}`);
    return {
        ok: true,
        value: {
            ...nonParsedDetails,
            readme: String(readme),
            auditTime: modules.map(it => it.auditTime).reduce((sum, it) => (sum ?? 0) + (it ?? 0), 0),
            loc: modules.map(it => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
            modules: modules,
            doc_urls: docUrls,
            repo_urls: repos,
            tags: tags
        }
    };
};
const getRepoName = (contest) => {
    let split = contest.template_repo_name.split("/");
    if (split[split.length - 1] === "")
        split.pop();
    let name = split.pop();
    return name;
};
const sherlockStatusToStatus = (status) => {
    switch (status) {
        case "CREATED": return "created";
        case "FINISHED": return "finished";
        case "SHERLOCK_JUDGING":
        case "JUDGING": return "judging";
        case "RUNNING": return "active";
        default:
            sentryError(`unknown status ${status}`);
            return "active";
    }
};
const findModuleSloc = (line, contest, contestName, repos, baseUrl) => {
    try {
        let includesSol = line.includes(".sol");
        if (includesSol) {
            let lineSplit = line.split(".sol").map(it => it.trim());
            let path = lineSplit[0] + ".sol";
            path = path.replace("- [", "");
            path = path.replace("- ", "");
            path = path.replace("`", "");
            let loc = 0;
            let url = `${baseUrl}/${path}`;
            let name = path.split("/").pop();
            return {
                module: {
                    name: name,
                    path: path,
                    url: url,
                    loc: loc,
                    contest: contestName,
                    active: 1,
                    auditTime: loc * secondsPerLoc
                }
            };
        }
        else {
            // if is git repo similar to "[index-coop-smart-contracts @ 317dfb677e9738fc990cf69d198358065e8cb595](https://github.com/IndexCoop/index-coop-smart-contracts/tree/317dfb677e9738fc990cf69d198358065e8cb595)"
            // then  return the link
            let lineSplit = line.split("](").map(it => it.trim());
            if (lineSplit.length < 2)
                return {};
            let url = lineSplit[1].split(")")[0];
            return {
                repo: url
            };
        }
    }
    catch (e) {
        console.log(`failed to parse line ${line}`);
    }
    return {};
};
const getTimestamp = (date) => {
    var someDate = new Date(date);
    return someDate.getTime() / 1000;
};
//# sourceMappingURL=sherlockContestParser.js.map