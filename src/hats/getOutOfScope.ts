let inScopeKeywords = [
  "within.*scope",
  "in scope"
]

export const getOutOfScope = (split: string[]) => {
  // "Thoses contracts are considered OUT OF SCOPE :\n\n-
  // contracts/PresaleVesting/SeedPresaleCvg.sol\n- contracts/PresaleVesting/WlPresaleCvg.sol\n-
  // contracts/CloneFactory.sol\n- contracts/CvgControlTower.sol\n- contracts/mocks/**\n-
  // contracts/Upgradeable/**\n- contracts/Oracles/CvgV3Aggregator.sol"  

  let paths = split.reduce((acc, it) => {
    let match = it.match(/\s.*(.sol|\*\*)$/);
    if (match) acc.push(match[0].trim());
    return acc;
  }, [] as string[]);

  return paths;
};

export const getInScopeFromOutOfScope = (split: string[]) => {
  if (!split.some(it => inScopeKeywords.some(k => it.match(k) !== null))) {
    return undefined
  }

  // find out of scope section. after that, all of the mentioned files are out of scope
  let inScopeStart = split.findIndex(it => inScopeKeywords.some(k => it.match(k) !== null))

  let scope = [] as string[];
  let inScope = false

  inScope = getInScopeLines(inScopeStart, split, inScope, scope);

  let modules = getModules("", scope)
  return modules
  // if there is `in scope` `within the scope` part, then use that part
}

export const getModules = (path: string, inScopeTree: string[]) => {
  /**
├── Announcements.sol
├── MultiSig.sol
├── interfaces
│   ├── IAvatar.sol
│   └── INodeSafeRegistry.sol
├── node-stake
│   ├── NodeSafeRegistry.sol
│   └── permissioned-module
│       ├── CapabilityPermissions.sol
│       └── SimplifiedModule.sol
   */

  let modules = [] as string[];
  let currentPath = ""

  for (let i = 0; i < inScopeTree.length; i++) {
    let line = inScopeTree[i];
    let { module, currentDir } = getModuleFromTree(line, currentPath);
    if (module) modules.push(module);
    else currentPath = currentDir;
  }

  return modules
}

const getModuleFromTree = (line: string, currentDir: string) => {
  line = line.trim()
  let isDir = !line.endsWith(".sol");

  if (isDir) {
    let depth = line.match(/(├|│|└)/g)!.length
    let prevDepth = currentDir.split("/").length
    let dirName = line.replace(/(├|│|─|└)/g, "").trim()

    if (!currentDir || depth <= prevDepth) return { undefined, currentDir: dirName }

    let newDir = currentDir.split("/").slice(-1).join("/")
    return { undefined, currentDir: `${newDir}/${dirName}` }
  }
  else {
    let module = line.replace(/(├|│|─|└)/g, "").trim()
    if (currentDir) return { module: `${currentDir}/${module}`, currentDir }
    else return { module, currentDir }
  }
}

const getInScopeLines = (inScopeStart: number, split: string[], inScope: boolean, scope: string[]) => {
  const scopeStartEnd = (line: string) => line.match(/^```.*$/g)

  for (let i = inScopeStart; i < split.length; i++) {
    let line = split[i];
    let startEnd = scopeStartEnd(line);

    if (!inScope) {
      if (startEnd) inScope = true;

    } else {
      if (startEnd) break;
      scope.push(line);
    }
  }
  return inScope;
};