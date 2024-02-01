import { ContestModule } from "ah-shared"
import { Project, ReposInformation } from "./types.js"
import { ignoredScopeFiles } from "../util.js"
import { getInScopeFromOutOfScope, getOutOfScope } from "./getOutOfScope.js"
import { parseTreeModulesV2 } from "../parse-modules.js"
import {
  cryptoIgnoreGlobs,
  cryptoIncludeGlobs,
  getGitFilePaths,
} from "../utils/getGitFilePaths.js"

export const getModules = async (
  contest: Project,
  name: string
): Promise<ContestModule[]> => {
  let jobs = contest.scope.reposInformation.map((it) =>
    getModulesRepo(it, contest, name)
  )
  let res = await Promise.all(jobs)
  return res.flat()
}

const getModulesRepo = async (
  repoInfo: ReposInformation,
  contest: Project,
  name: string
) => {
  let files = await getGitFilePaths({
    url: repoInfo.url,
    includeGlobs: cryptoIncludeGlobs,
    ignoreGlobs: cryptoIgnoreGlobs,
  })

  files = files.filter(
    (path) =>
      !ignoredScopeFiles.some((excludePath) => path.includes(excludePath))
  )

  let allReposFilteredPaths = getInScopeFromScopeDescription(
    contest.scope.description
  )
  let filteredPaths =
    allReposFilteredPaths.find((it) => {
      return it.some((it) => it.includes(repoName!))
    }) ?? []

  // some retain repo name in path
  filteredPaths = filteredPaths.map((it) =>
    it.replace(new RegExp(`^${repoName}/`), "")
  )

  if (filteredPaths.length === 0) {
    let split = contest.scope.outOfScope.split("\n")
    try {
      filteredPaths = getInScopeFromOutOfScope(split)
    } catch (e) {}

    if (filteredPaths.length === 0) {
      let outOfScopePaths = getOutOfScope(split)

      filteredPaths = files.filter((path) => {
        return !outOfScopePaths.some((excludePath) => {
          let trimmedPath = removeSuffix(excludePath, "**")
          return path.startsWith(trimmedPath)
        })
      })
    }
  }

  let repoRawContentUrl = repoInfo.url.replace(
    "github.com",
    "raw.githubusercontent.com"
  )
  let commit = repoInfo.commitHash

  let urls = filteredPaths.map((path) => {
    let url = `${repoRawContentUrl}/${commit}/${path}`
    return url
  })

  return filteredPaths.map((it, index) => {
    let res: ContestModule = {
      name: it.split("/").pop() as string,
      path: it,
      url: urls[index],
      contest: name,
      active: 1,
    }

    return res
  })
}

// let getInScopeFromScopeDescription = (scope: string): string[][] => {

// }

let getInScopeFromScopeDescription = (scope: string): string[][] => {
  let lines = scope.split("\n")
  let inScope = [] as string[]
  let inScopeStarted = false

  for (let line of lines) {
    if (
      line.includes("## ") &&
      line.includes("scope") &&
      !line.includes("out of scope")
    ) {
      inScopeStarted = true
      continue
    }

    if (
      inScopeStarted &&
      (line.includes("out of scope") || line.includes("## "))
    ) {
      inScopeStarted = false
      continue
    }

    if (inScopeStarted) {
      let trimmed = line.trim()
      if (trimmed === "") continue
      if (trimmed.startsWith("```")) continue
      if (trimmed.startsWith("*")) continue
      if (trimmed.startsWith("#")) continue
      inScope.push(line)
    }
  }

  // can have multiple repos
  const regex = /```[\s\S]*?```/g
  const blocks = scope.match(regex)
  return blocks?.map((block) => parseTreeModulesV2(block.split("\n"))) ?? []
}

function removeSuffix(excludePath: string, suffix: string): string {
  let excludedUntil = 0
  for (let i = 0; i < suffix.length; i++) {
    let char = excludePath[excludePath.length - 1 - i]
    if (char !== suffix[suffix.length - 1 - i]) break
    excludedUntil++
  }

  return excludePath.slice(0, excludePath.length - excludedUntil)
}
