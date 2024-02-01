import { glob } from "glob"
import Logger from "js-logger"
import { workingDir, moduleExtensions } from "../util.js"
import fs from "fs"
import git from "simple-git"

export let cryptoIncludeGlobs = moduleExtensions.map((it) => `**/*${it}`)

export type Input = {
  url: string
  includeGlobs: string[]
  ignoreGlobs?: string[]
}

let ignoredScopeFolders = ["test", "tests", "mock", "mocks", "script", "forge-std", "hardhat"]
let ignoreScopeFiles = [".s.sol"]
export let cryptoIgnoreGlobs = [
  ...ignoredScopeFolders.map((it) => `**/${it}/**`),
  ...ignoreScopeFiles.map((it) => `**/${it}`),
]

export const getGitFilePaths = async ({
  url,
  includeGlobs,
  ignoreGlobs = [],
}: Input): Promise<string[]> => {
  if (url.endsWith("/")) url = url.slice(0, -1)
  let repoName = url.split("/").pop()

  Logger.info(`cloning ${repoName}`)

  let dir = process.env.LAMBDA_TASK_ROOT
    ? `/tmp/${repoName}`
    : `${workingDir()}/tmp/${repoName}`
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true }) // TODO: uncomment

  await git().clone(url, dir, ["--depth", "1"])

  let files = [] as string[]

  includeGlobs.forEach((includeGlob) => {
    files.push(
      ...glob.sync(`${dir}/${includeGlob}`).map((it) => it.replace(dir, ""))
    )
  })

  let ignoredFiles = ignoreGlobs.map((it) => glob.sync(`${dir}/${it}`)).flat()
  files = files.filter((path) => !ignoredFiles.includes(path))

  return files
}
