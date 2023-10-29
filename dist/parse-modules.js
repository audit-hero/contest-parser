// general module parser from a tree. finds the files that end with .sol, and their directory paths
//  according to character count before the directories.
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
export const parseTreeModules = (scope) => {
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
        if (line.includes(".sol")) {
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
                currentPath = currentPath.split("/").slice(0, -1).join("/") + `/${firstWord[0]}`;
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
    return modules;
};
//# sourceMappingURL=parse-modules.js.map