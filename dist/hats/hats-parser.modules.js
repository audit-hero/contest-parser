import git from "simple-git";
import { workingDir } from "../util.js";
import { glob } from "glob";
import fs from "fs";
import Logger from "js-logger";
import { getInScopeFromOutOfScope, getOutOfScope } from "./getOutOfScope.js";
export const getModules = async (contest, name) => {
    // 1. git clone repo
    let repoInfo = contest.scope.reposInformation.find(it => it.isMain);
    if (!repoInfo)
        return [];
    // if in lambda
    let dir = process.env.LAMBDA_TASK_ROOT ? "/tmp" : `${workingDir()}/tmp/`;
    if (!fs.existsSync(dir) && true) {
        await git().clone(repoInfo.url, dir, ["--depth", "1"]);
    }
    else {
        Logger.info(`repo already cloned in ${dir}`);
    }
    // get all .sol files in the repo
    let files = glob.sync(`${dir}/**/*.sol`).map(it => it.replace(dir, ""));
    // 2. filter out of scope files
    let split = contest.scope.outOfScope.split("\n");
    let filteredPaths;
    try {
        filteredPaths = getInScopeFromOutOfScope(split);
    }
    catch (e) { }
    if (!filteredPaths) {
        let outOfScopePaths = getOutOfScope(split);
        filteredPaths = files.filter(path => {
            return !outOfScopePaths.some(excludePath => {
                let trimmedPath = removeSuffix(excludePath, "**");
                return path.startsWith(trimmedPath);
            });
        });
    }
    let repoRawContentUrl = repoInfo.url.replace("github.com", "raw.githubusercontent.com");
    let commit = repoInfo.commitHash;
    let urls = filteredPaths.map(path => {
        let url = `${repoRawContentUrl}/${commit}/${path}`;
        return url;
    });
    return filteredPaths.map((it, index) => {
        let res = {
            name: it.split("/").pop(),
            path: it,
            url: urls[index],
            contest: name,
            active: 1
        };
        return res;
    });
};
function removeSuffix(excludePath, suffix) {
    let excludedUntil = 0;
    for (let i = 0; i < suffix.length; i++) {
        let char = excludePath[excludePath.length - 1 - i];
        if (char !== suffix[suffix.length - 1 - i])
            break;
        excludedUntil++;
    }
    return excludePath.slice(0, excludePath.length - excludedUntil);
}
//# sourceMappingURL=hats-parser.modules.js.map