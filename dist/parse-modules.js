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
        if (lineIsFile(line)) {
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
/*
parses this kind:

contracts/
└── core/
    ├── ccip/
    │   ├── base/
    │   │   └── SDLPoolCCIPController.sol
    │   ├── RESDLTokenBridge.sol
    │   ├── SDLPoolCCIPControllerPrimary.sol
    │   ├── SDLPoolCCIPControllerSecondary.sol
    │   └── WrappedTokenBridge.sol
    └── sdlPool/
        ├── base/
        │   └── SDLPool.sol
        ├── LinearBoostController.sol
        ├── SDLPoolPrimary.sol
        └── SDLPoolSecondary.sol
    └── RewardsInitiator.sol

expects that there is a whitespace " " before the name of the file or directory. That will be used as the depth indicator.
*/
export let parseTreeModulesV2 = (lines) => {
    let paths = [];
    let currentPath = []; // Start with "contracts" as the base directory
    // Iterate through the lines, ignoring the first one as it just contains "contracts/"
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith("```"))
            continue;
        const depth = line.lastIndexOf(" ");
        if (depth === -1 && currentPath.length === 0) {
            currentPath = [line.trim()];
        }
        const name = line
            .substr(depth + 1)
            .replace(/[└├─│]/g, "")
            .trim();
        // Adjust current path based on depth
        currentPath = currentPath.slice(0, depth / 4 + 1); // Using 4 spaces as one indentation level, +1 for the "contracts" base
        // Check if the name ends with '.sol', which indicates it's a file
        if (lineIsFile(name)) {
            const filePath = [...currentPath, name].join("/"); // Construct the full file path
            paths.push(filePath);
        }
        else {
            currentPath.push(name); // Add the new directory to the current path
        }
    }
    return paths.map((path) => path.replaceAll("//", "/"));
};
let lineIsFile = (line) => {
    return line.match(/.*\.[a-zA-Z0-9]+$/);
};
//# sourceMappingURL=parse-modules.js.map