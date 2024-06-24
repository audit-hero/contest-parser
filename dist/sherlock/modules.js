import { findDocUrl, getMdHeading, moduleExtensions } from "../util.js";
export const findModules = ({ lines, contest, name, repos, readmeObj, }) => {
    let afterInScope = false;
    let headings = [];
    let docUrls = [];
    let modules = [];
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
        if (line.toLowerCase().includes("not in scope") ||
            line.toLowerCase().includes("out of scope") ||
            line.startsWith("#")) {
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
    return { modules, docUrls };
};
const findModuleSloc = (line, contest, contestName, repos, baseUrl) => {
    try {
        let includesExtension = moduleExtensions.some((it) => line.includes(it));
        if (includesExtension) {
            let extension = moduleExtensions.find((it) => line.includes(it));
            let lineSplit = line.split(extension).map((it) => it.trim());
            let path = lineSplit[0] + extension;
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
                },
            };
        }
        else {
            // if is git repo similar to "[index-coop-smart-contracts @ 317dfb677e9738fc990cf69d198358065e8cb595](https://github.com/IndexCoop/index-coop-smart-contracts/tree/317dfb677e9738fc990cf69d198358065e8cb595)"
            // then  return the link
            let lineSplit = line.split("](").map((it) => it.trim());
            if (lineSplit.length < 2)
                return {};
            let url = lineSplit[1].split(")")[0];
            return {
                repo: url,
            };
        }
    }
    catch (e) {
        console.log(`failed to parse line ${line}`);
    }
    return {};
};
//# sourceMappingURL=modules.js.map