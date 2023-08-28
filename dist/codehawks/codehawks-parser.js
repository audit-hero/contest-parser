import { sentryError } from "ah-shared";
import { findDocUrl, findTags, getAllRepos, getMdHeading } from "../util";
import Logger from "js-logger";
export const parseActiveCodeHawksContests = async (existingContests) => {
    let possibleActive = await getPossiblyActiveContests();
    let active = await parseReposJobs(possibleActive, existingContests);
    return active.filter(it => it !== undefined);
};
export const getPossiblyActiveContests = async () => {
    let repos = await getAllRepos("Cyfrin");
    let contestRepos = repos.filter((it) => {
        return it.name.match(new RegExp("^\\d{4}-\\d{2}-\\w+$")) !== null;
    });
    let possiblyActiveContests = contestRepos.filter((it) => {
        let split = it.name.split("-");
        let year = parseInt(split[0]);
        let month = parseInt(split[1]);
        let ms = new Date(year, month - 1).getTime();
        // max 3 months old
        return ms > Date.now() - 1000 * 60 * 60 * 24 * 30 * 3;
    });
    return possiblyActiveContests;
};
export const parseReposJobs = async (contests, existingContests) => {
    let jobs = [];
    for (let i = 0; i < contests.length; ++i) {
        let contestExists = existingContests.find(it => it.pk === contests[i].name);
        if (contestExists && contestExists.modules.length > 0) {
            Logger.info(`contest ${contests[i].name} already exists, skipping`);
            continue;
        }
        else {
            let name = contests[i].name;
            let readme = await getReadmeFromGithub(name);
            if (!readme) {
                Logger.info(`no readme found for ${name}`);
                continue;
            }
            let contest = await parseContest(name, contests[i].html_url, readme)
                .then(it => {
                if (!it.ok) {
                    sentryError(it.error, `failed to parse sherlock contest ${contests[i].name}`, "daily");
                    return undefined;
                }
                return it.value;
            }).catch(e => {
                sentryError(e, `failed to parse sherlock contest ${contests[i].name}`, "daily");
                return undefined;
            });
            jobs.push(contest);
        }
    }
    return jobs;
};
export const parseContest = async (name, url, readme) => {
    let split = readme.split("\n");
    let { startDate, endDate } = getStartEndDate(split);
    let dateError = getDatesError(startDate, endDate, name);
    if (dateError)
        return { ok: false, error: dateError.error };
    let hmAwards = getHmAwards(split, name);
    let { inScopeParagraph, beforeScopeParagraph } = getBeforeScopeAndInScopeParagraph(split);
    let docUrls = findDocUrls(beforeScopeParagraph);
    let modules = getModules(inScopeParagraph, name);
    let tags = findTags(split);
    let result = {
        pk: name,
        sk: "0",
        url: `https://www.codehawks.com/contests`,
        start_date: startDate,
        end_date: endDate,
        platform: "codehawks",
        active: 1,
        status: "active",
        prize: `${hmAwards}$`,
        loc: modules.map(it => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
        modules: modules,
        doc_urls: docUrls,
        repo_urls: [url],
        tags: tags
    };
    return { ok: true, value: result };
};
const getHmAwards = (readme, name) => {
    /**
     * - Total Prize Pool: $15,000
    - HM Awards: $14,000
    - Low Awards: $1,000
    - No GAS, Informational, or QAs
     */
    let hmAwards = 0;
    for (let line of readme) {
        if (line.toLowerCase().includes("hm awards")) {
            let split = line.split(":");
            if (split.length < 2)
                continue;
            let amount = split[1].trim();
            hmAwards = parseInt(amount.replace("$", "").replace(",", ""));
        }
    }
    if (hmAwards === 0)
        sentryError(`no hm awards found for ${name}`);
    return hmAwards;
};
const getDatesError = (startDate, endDate, name) => {
    if (endDate < Date.now() / 1000) {
        return {
            error: `contest ${name} has already ended`
        };
    }
    if (startDate > Date.now() / 1000) {
        return {
            error: `contest ${name} hasn't started yet`
        };
    }
};
const getModules = (inScopeParagraph, contest) => {
    /**
     -   src/
      -   ProxyFactory.sol
      -   Distributor.sol
      -   Proxy.sol
     */
    // parsing logic: find the tabbings to get the directories.
    // if the line ends with .sol, then it's a module
    let modules = [];
    let currentFolder = "";
    for (let line of inScopeParagraph) {
        if (line.toLowerCase().includes("all") && line.toLowerCase().includes("in") && line.toLowerCase().includes("src")) {
            Logger.info("!! all sol files in src are in scope");
            sentryError(`All modules in src are in scope for ${contest}`);
            break;
        }
        let { module, currentDir } = findModuleFromUl(line, inScopeParagraph, currentFolder, contest);
        currentFolder = currentDir;
        if (module)
            modules.push(module);
    }
    if (modules.length === 0)
        sentryError(`no modules found for ${contest}`);
    return modules;
};
const findModuleFromUl = (line, lines, currentDir, repo) => {
    let module = undefined;
    try {
        let isRootDir = line.startsWith("- ");
        if (isRootDir)
            return { module, currentDir: line.replace("- ", "").trim() };
        let isModule = line.endsWith(".sol");
        if (isModule) {
            let name = line.replace("- ", "").trim();
            let path = `${currentDir}/${name}`.replace("//", "/");
            module = {
                name: name,
                path: path,
                url: "",
                contest: repo,
                active: 1,
            };
        }
    }
    catch (e) {
        console.log(`failed to parse line ${line}`);
    }
    return { module, currentDir };
};
const getBeforeScopeAndInScopeParagraph = (readme) => {
    let inScopeParagraph = [];
    let beforeScopeParagraph = [];
    let afterInScope = false;
    for (let line of readme) {
        if (!afterInScope) {
            beforeScopeParagraph.push(line);
            if (line.toLowerCase().includes("scope") &&
                line.toLowerCase().includes("# "))
                afterInScope = true;
            continue;
        }
        if (line.toLowerCase().includes("not in scope") || line.toLowerCase().includes("out of scope") || line.startsWith("#")) {
            break;
        }
        else {
            inScopeParagraph.push(line);
        }
    }
    return { inScopeParagraph, beforeScopeParagraph };
};
const findDocUrls = (beforeScopeLines) => {
    let docUrls = [];
    let heading = "";
    for (let line of beforeScopeLines) {
        let newHeading = getMdHeading(line);
        if (newHeading)
            heading = newHeading;
        let newDocs = findDocUrl(line, heading);
        if (newDocs.length > 0)
            docUrls = docUrls.concat(newDocs);
    }
    return docUrls;
};
const getReadmeFromGithub = async (contest) => {
    let baseUrl = `https://raw.githubusercontent.com/Cyfrin/${contest}/main`;
    let readme = await fetch(`${baseUrl}/README.md`).catch((e) => {
        return undefined;
    }).then(async (it) => {
        return it?.text();
    });
    if (readme)
        return readme;
    Logger.info(`no readme found for ${contest}`);
    return undefined;
};
function getStartEndDate(readme) {
    let startDate = 0;
    let endDate = 0;
    for (let line of readme) {
        /**
        - Starts August 21, 2023
        - Ends August 28th, 2023
         */
        if (line.startsWith("- Starts")) {
            let date = line.split("Starts")[1].trim().replace(/(th|st|nd|rd),/, ',');
            startDate = getTimestamp(date);
            if (isNaN(startDate))
                startDate = 0;
        }
        else if (line.startsWith("- Ends")) {
            let date = line.split("Ends")[1].trim().replace(/(th|st|nd|rd),/, ',');
            endDate = getTimestamp(date);
            if (isNaN(endDate))
                endDate = 0;
        }
    }
    if (startDate === 0 || endDate === 0)
        sentryError(`no start or end date found for ${readme}`);
    return { startDate, endDate };
}
const getTimestamp = (date) => {
    // August 21, 2023   
    var someDate = new Date(date);
    return someDate.getTime() / 1000;
};
//# sourceMappingURL=codehawks-parser.js.map