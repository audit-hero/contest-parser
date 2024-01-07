import axios from "axios";
import log from "js-logger";
import { findTags } from "../util";
import { sentryError } from "ah-shared";
import { getTimestamp, findModules, getHmAwards, truncateLongNames, } from "./parse-utils.js";
export const parseActiveC4Contests = async (existingContests) => {
    let active = await getActiveC4Contests();
    let res = await Promise.all(parseC4Contests(active, existingContests));
    return res.filter((it) => it !== undefined);
};
export const parseC4Contests = (contests, existingContests) => {
    let jobs = [];
    for (let i = 0; i < contests.length; ++i) {
        let contestExists = existingContests.find((it) => it.pk === contests[i].trimmedSlug);
        if (contestExists && contestExists.modules.length > 0) {
            log.info(`contest ${contests[i].title} already exists, skipping`);
            continue;
        }
        let contest = parseC4Contest(contests[i])
            .then((it) => {
            if (!it.ok)
                sentryError(it.error, `failed to parse c4 contest ${contests[i].title}`);
            else
                return it.value;
        })
            .catch((err) => {
            sentryError(err, `error parsing c4 contest ${contests[i].title}`);
            return undefined;
        });
        jobs.push(contest);
    }
    return jobs;
};
export const getActiveC4Contests = async () => {
    let contests = await axios
        .get("https://code4rena.com/contests", { headers: { rsc: 1 } })
        .catch((e) => {
        console.log(`error ${e}`);
        throw Error("can't fetch code4rena");
    })
        .then((it) => {
        let contests = it.data
            .split(`contests\":`)[1]
            .split('}],"coreAppPage"')[0];
        let contestsJson = JSON.parse(contests);
        return contestsJson;
    });
    let currentDate = Date.now();
    if (!contests)
        return [];
    let activeContests = contests.filter((it) => {
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
        await axios
            .get(rawUrl)
            .catch((e) => {
            console.log(`Can't get repo ${rawUrl} (prolly private or upcoming) ${e}`);
        })
            .then((it) => {
            readmeRaw = it?.data;
        });
    }
    // parse the md file
    let result = parseMd(url, readmeRaw, repo, contest);
    return result;
};
// sorted desc
export const parseMd = (url, readme, repo, contest) => {
    // find lines that start with "|[src"
    let tags = [];
    let start_date = getTimestamp(contest.start_time), end_date = getTimestamp(contest.end_time);
    let modules = [];
    let docUrls = [];
    let hmAwards = trimContestAmount(contest.amount);
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
            loc: modules.map((it) => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
            modules: modules.filter((it) => it.url?.endsWith(".sol")),
            all_modules: modules,
            doc_urls: docUrls,
            repo_urls: [repo],
            tags: tags,
        },
    };
};
let usdCoins = ["USDC", "USDT", "DAI", "TUSD", "BUSD", "USDP", "UST"];
export let trimContestAmount = (amount) => {
    amount = amount.replace("$$", "$").replace(" in ", " ");
    if (usdCoins.some((it) => amount.includes(it))) {
        amount = amount.replace("$", "").replace(" ", "");
        usdCoins.forEach((it) => {
            amount = amount.replace(it, "");
        });
        amount = amount + " $";
    }
    return amount;
};
//# sourceMappingURL=c4ContestParser.js.map