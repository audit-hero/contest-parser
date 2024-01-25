// general module parser from a tree. finds the files that end with .sol, and their directory paths
//  according to character count before the directories.
import Logger from "js-logger";
/**
 *
all of these options should work
```js
contracts
├── interfaces
    ├── oracles
        ├── IChainlinkOracle.sol
        ├── IGMXOracle.sol
|   ├── strategy
        ├── gmx
|   |-      ├── IGMXVault.sol
            ├── IGMXVaultEvent.sol
├── oracles
        ├── ChainlinkARBOracle.sol
  _     ├── GMXOracle.sol
```
 */
export const parseTreeModulesOld = (scope) => {
    // if line contains .sol, then it is a module
    // otherwise, it is a directory expansion
    let modules = [];
    let currentPath = "";
    let lastPathDepth = 0;
    let lastDepths = {};
    for (let i = 0; i < scope.length; i++) {
        let line = scope[i];
        if (line.trim().startsWith("```"))
            continue;
        if (nameIsFile(line)) {
            let module = line.match(/\w+\.sol/);
            if (module)
                modules.push(`${currentPath}/${module[0]}`);
        }
        else {
            // characters until the first word
            let firstWord = line.match(/\w+/);
            if (!firstWord)
                continue;
            let firstWordIndex = firstWord.index;
            if (firstWordIndex > lastPathDepth) {
                currentPath = `${currentPath}/${firstWord[0]}`;
                lastPathDepth = firstWordIndex;
            }
            else if (firstWordIndex === lastPathDepth) {
                currentPath =
                    currentPath.split("/").slice(0, -1).join("/") + `/${firstWord[0]}`;
            }
            else {
                // find the first depth that is less than the current depth
                let dir = "";
                let keys = Object.keys(lastDepths);
                for (let i = keys.length - 1; i >= 0; i--) {
                    let depthNr = parseInt(keys[i]);
                    if (depthNr < firstWordIndex) {
                        dir = lastDepths[depthNr] + `/${firstWord[0]}`;
                        break;
                    }
                }
                currentPath = dir;
                lastPathDepth = firstWordIndex;
            }
            lastDepths[lastPathDepth] = firstWord[0];
        }
    }
    if (modules.length === 0) {
        modules = parseTreeModulesV2(scope);
    }
    return modules;
};
export let parseTreeModulesV2 = (lines) => {
    let paths = [];
    let currentPath = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith("```"))
            continue;
        const depth = line.lastIndexOf(" ");
        const name = line
            .substr(depth + 1)
            .replace(/[└├─│]/g, "")
            .trim();
        if (nameIsFile(name)) {
            if (currentPath.length > 0 && depth <= currentPath[currentPath.length - 1].depth) {
                // lower the path depth. remove until the current depth and replace
                for (let i = currentPath.length - 1; i >= 0; i--) {
                    if (currentPath[i].depth >= depth) {
                        currentPath.splice(i, 1);
                    }
                }
            }
            const filePath = [...currentPath.map(it => it.part), name].join("/");
            paths.push(filePath);
        }
        else if (nameIsDir(name)) {
            if (currentPath.length > 0 && depth <= currentPath[currentPath.length - 1].depth) {
                // lower the path depth. remove until the current depth and replace
                for (let i = currentPath.length - 1; i >= 0; i--) {
                    if (currentPath[i].depth >= depth) {
                        currentPath.splice(i, 1);
                    }
                }
                currentPath.push({
                    depth,
                    part: name
                });
            }
            else {
                currentPath.push({
                    depth,
                    part: name
                }); // Add the new directory to the current path
            }
        }
        else {
            Logger.info("unknown line", name);
        }
    }
    return paths.map((path) => path.replaceAll("//", "/"));
};
let nameIsDir = (name) => {
    // does not include normal character after last " "
    return name.match(/^(\/?[\w+\-_.]+\/?)$/);
};
let nameIsFile = (line) => {
    return line.match(/.*\.[a-zA-Z0-9]+(\/|)$/);
};
//# sourceMappingURL=parse-modules.js.map