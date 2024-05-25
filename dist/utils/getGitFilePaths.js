import { glob } from "glob";
import { Logger } from "jst-logger";
import { workingDir, moduleExtensions } from "../util.js";
import fs from "fs";
import { execSync } from "child_process";
export let cryptoIncludeGlobs = moduleExtensions.map((it) => `**/*${it}`);
let ignoredScopeFolders = [
    "test",
    "tests",
    "mock",
    "interfaces",
    "mocks",
    "script",
    "forge-std",
    "hardhat",
];
let ignoreScopeFileExtensions = ["s.sol", "t.sol"];
export let cryptoIgnoreGlobs = [
    ...ignoredScopeFolders.map((it) => `**/${it}/**`),
    ...ignoreScopeFileExtensions.map((it) => `**/*.${it}`),
    // interfaces
    // "**/I*.sol", need to test it
];
export const getGitFilePaths = async ({ url, includeGlobs, ignoreGlobs = [], }) => {
    if (url.endsWith("/"))
        url = url.slice(0, -1);
    let repoName = url.split("/").pop();
    url = gitConvertHttpsToSsh(url);
    Logger.info(`cloning ${repoName}: ${url}`);
    let dir = process.env.LAMBDA_TASK_ROOT
        ? `/tmp/${repoName}`
        : `${workingDir()}/tmp/${repoName}`;
    if (fs.existsSync(dir))
        fs.rmSync(dir, { recursive: true });
    execSync(`git clone ${url} ${dir} --depth 1`, {
        encoding: "utf8",
        stdio: "inherit",
    });
    let files = [];
    includeGlobs.forEach((includeGlob) => {
        files.push(...glob.sync(`${dir}/${includeGlob}`).map((it) => it.replace(dir, "")));
    });
    let ignoredFiles = ignoreGlobs
        .map((it) => glob.sync(`${dir}/${it}`).map((it) => it.replace(dir, "")))
        .flat();
    files = files.filter((path) => !ignoredFiles.includes(path));
    return files;
};
let gitConvertHttpsToSsh = (url) => {
    let match = url.match(/https:\/\/github.com\/(.*)/);
    if (match) {
        let [_, repo] = match;
        return `git@github.com:${repo}`;
    }
    return url;
};
//# sourceMappingURL=getGitFilePaths.js.map