// general module parser from a tree. finds the files that end with .sol, and their directory paths
//  according to character count before the directories.

import { Logger } from "jst-logger"

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
export const parseTreeModulesOld = (scope: string[]) => {
  // if line contains .sol, then it is a module
  // otherwise, it is a directory expansion
  let modules = [] as string[]
  let currentPath = ""
  let lastPathDepth = 0
  let lastDepths = {} as Record<number, string>

  for (let i = 0; i < scope.length; i++) {
    let line = scope[i]
    if (line.trim().startsWith("```")) continue

    if (nameIsFile(line)) {
      let module = line.match(/\w+\.sol/)
      if (module) modules.push(`${currentPath}/${module[0]}`)
    } else {
      // characters until the first word
      let firstWord = line.match(/\w+/)
      if (!firstWord) continue

      let firstWordIndex = firstWord.index!

      if (firstWordIndex > lastPathDepth) {
        currentPath = `${currentPath}/${firstWord[0]}`
        lastPathDepth = firstWordIndex
      } else if (firstWordIndex === lastPathDepth) {
        currentPath = currentPath.split("/").slice(0, -1).join("/") + `/${firstWord[0]}`
      } else {
        // find the first depth that is less than the current depth
        let dir = ""
        let keys = Object.keys(lastDepths)
        for (let i = keys.length - 1; i >= 0; i--) {
          let depthNr = parseInt(keys[i])
          if (depthNr < firstWordIndex) {
            dir = lastDepths[depthNr] + `/${firstWord[0]}`
            break
          }
        }

        currentPath = dir
        lastPathDepth = firstWordIndex
      }

      lastDepths[lastPathDepth] = firstWord[0]
    }
  }

  if (modules.length === 0) {
    modules = parseTreeModulesV2(scope)
  }

  return modules
}

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
        |-- all/
        |   ├── **ALL** // will be ignored
        ├── LinearBoostController.sol
        ├── SDLPoolPrimary.sol
        └── SDLPoolSecondary.sol
    └── RewardsInitiator.sol

expects that there is a whitespace " " before the name of the file or directory. That will be used as the depth indicator.
*/
type Path = {
  depth: number
  part: string
}

export let parseTreeModulesV2 = (lines: string[]) => {
  let paths = []
  let currentPath = [] as Path[]

  for (let i = 0; i < lines.length; i++) {
    const line_ = lines[i]
    if (line_.trim() === "" || line_.trim().startsWith("```")) continue

    // if there are comments (starting with non word chard) after some word characters, then remove them
    let line = line_.match(/.*\w+/)![0].replace("\t", "        ")
    const depth = line.lastIndexOf(" ")
    const name = line.slice(depth + 1).trim()

    if (nameIsFile(name)) {
      if (currentPath.length > 0 && depth <= currentPath[currentPath.length - 1].depth) {
        // lower the path depth. remove until the current depth and replace
        for (let i = currentPath.length - 1; i >= 0; i--) {
          if (currentPath[i].depth >= depth) {
            currentPath.splice(i, 1)
          }
        }
      }

      const filePath = [...currentPath.map((it) => it.part), name].join("/")
      paths.push(filePath)
    } else if (nameIsDir(name)) {
      if (currentPath.length > 0 && depth <= currentPath[currentPath.length - 1].depth) {
        // lower the path depth. remove until the current depth and replace
        for (let i = currentPath.length - 1; i >= 0; i--) {
          if (currentPath[i].depth >= depth) {
            currentPath.splice(i, 1)
          }
        }

        currentPath.push({
          depth,
          part: name,
        })
      } else {
        currentPath.push({
          depth,
          part: name,
        }) // Add the new directory to the current path
      }
    } else {
      Logger.info(`unknown line in tree parsing: ${line} > ${name}`)
    }
  }

  return paths.map((path) => removeDotPrefix(path.replaceAll("//", "/")))
}

let removeDotPrefix = (path: string) => {
  if (path.startsWith("./")) {
    return path.slice(2)
  } else if (path.startsWith(".")) {
    return path.slice(1)
  }

  return path
}

let nameIsDir = (name: string) => {
  // does not include normal character after last " "
  return name.match(/^(\/?[\w+\-_.]+\/?)$/)
}

let nameIsFile = (line: string) => {
  return line.match(/.*\.[a-zA-Z0-9]+(\/|)$/)
}
