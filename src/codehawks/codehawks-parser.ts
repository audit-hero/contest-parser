import { sentryError, ContestModule, ContestWithModules, Repo } from "ah-shared"
import { findDocUrl, findTags, getAllRepos, getMdHeading } from "../util"
import Logger from "js-logger"
import E, { Either } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/function.js"

export const parseActiveCodeHawksContests = async (existingContests: ContestWithModules[]) => {
  let possibleActive = await getPossiblyActiveContests()
  let active = await parseReposJobs(possibleActive, existingContests)
  return active.filter(it => it !== undefined) as ContestWithModules[]
}

export const getPossiblyActiveContests = async (): Promise<Repo[]> => {
  let repos = await getAllRepos("Cyfrin")

  let contestRepos = repos.filter((it: { name: string }) => {
    return it.name.match(new RegExp("^\\d{4}-\\d{2}-\\w+$")) !== null
  })

  let possiblyActiveContests = contestRepos.filter((it: { name: string }) => {
    let split = it.name.split("-")
    let year = parseInt(split[0])
    let month = parseInt(split[1])

    let ms = new Date(year, month - 1).getTime()
    // max 3 months old
    return ms > Date.now() - 1000 * 60 * 60 * 24 * 30 * 3
  })

  return possiblyActiveContests
}

export const parseReposJobs = async (contests: Repo[], existingContests: ContestWithModules[]
) => {
  let jobs = [] as (ContestWithModules | undefined)[]

  for (let i = 0; i < contests.length; ++i) {
    let contestExists = existingContests.find(it => it.pk === contests[i].name)

    if (contestExists && contestExists.modules.length > 0) {
      Logger.info(`contest ${contests[i].name} already exists, skipping`)
      continue
    }
    else {
      let name = contests[i].name
      let readme = await getReadmeFromGithub(name)
      if (!readme) {
        Logger.info(`no readme found for ${name}`)
        continue
      }

      let res = pipe(
        await parseContest(name, contests[i].html_url, readme),
        E.fold(
          (e: string) => {
            sentryError(e, `failed to parse sherlock contest ${contests[i].name}`, "daily")
            return undefined
          },
          (c: ContestWithModules) => c
        )
      )

      jobs.push(res)
    }
  }

  return jobs
}

export const parseContest =
  async (name: string, url: string, readme: string): Promise<Either<string, ContestWithModules>> => {
    let split = readme.split("\n")

    let { startDate, endDate } = getStartEndDate(split)

    let dateError = getDatesError(startDate, endDate, name)
    if (dateError) return Promise.resolve(E.left(dateError.error))

    let hmAwards = getHmAwards(split, name)

    let { inScopeParagraph, beforeScopeParagraph } = getBeforeScopeAndInScopeParagraph(split)

    let docUrls = findDocUrls(beforeScopeParagraph)

    let modulesRes = await pipe(
      getModulesV1(inScopeParagraph, name),
      E.orElse(() => getModulesV2(inScopeParagraph, name, url)),
      E.getOrElseW((e: string) => {
        sentryError(`failed to parse modules for ${name}:\n${e}`)
        return [] as ContestModule[]
      }),
      await convertUrlToRawUrl(url),
    )

    let modules = pipe(
      modulesRes,
      E.getOrElseW((e: string) => {
        sentryError(`failed to parse modules for ${name}:\n${e}`)
        return [] as ContestModule[]
      })
    )

    let tags = findTags(split)

    let result: ContestWithModules = {
      pk: name,
      sk: "0",
      url: `https://www.codehawks.com/contests`,
      start_date: startDate,
      end_date: endDate,
      platform: "codehawks",
      active: 1, // end_date > now
      status: "active",
      prize: `${hmAwards}$`,
      loc: modules.map(it => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
      modules: modules,
      doc_urls: docUrls,
      repo_urls: [url],
      tags: tags
    }

    return Promise.resolve(E.right(result))
  }

const convertUrlToRawUrl = async (repo: string) => async (modules: ContestModule[]): Promise<Either<string, ContestModule[]>> => {
  // add src/contracts prefix to the url if it doesn't exist. if still can't find the module, then
  if (modules.length === 0 || !modules[0].url) return E.right([] as ContestModule[])

  let originalUrlVerify = await fetch(modules[0].url!)
  if (originalUrlVerify && originalUrlVerify.status !== 404) return E.right(modules)

  let rawUrl = repo.replace("github.com", "raw.githubusercontent.com")

  let prefixes = [
    `${rawUrl}/main/`,
    `${rawUrl}/main/src/`,
    `${rawUrl}/main/src/contracts/`,
    `${rawUrl}/main/contracts/`,
  ]

  const getPrefix = async (prefix: string): Promise<string | undefined> => {
    let res = await fetch(`${prefix}${modules[0].path}`)
    if (res && res.status !== 404) return prefix
    return undefined
  }

  let res = await Promise.all(prefixes.map(it => getPrefix(it)))
  let prefix = res.find(it => it !== undefined)

  if (!prefix) {
    sentryError(`failed to find module ${modules[0].path} in ${repo}`)
    E.left([] as ContestModule[])
  }

  return E.right(modules.map(it => {
    return {
      ...it,
      url: `${prefix}${it.path}`
    }
  }))
}

const getHmAwards = (readme: string[], name: string) => {
  /**
   * - Total Prize Pool: $15,000
  - HM Awards: $14,000
  - Low Awards: $1,000
  - No GAS, Informational, or QAs
   */

  let hmAwards = 0
  for (let line of readme) {
    if (line.toLowerCase().includes("hm awards")) {
      let split = line.split(":")
      if (split.length < 2) continue
      let amount = split[1].trim()
      hmAwards = parseInt(amount.replace("$", "").replace(",", ""))
    }
  }

  if (hmAwards === 0) sentryError(`no hm awards found for ${name}`)

  return hmAwards
}

const getDatesError = (startDate: number, endDate: number, name: string) => {
  if (endDate < Date.now() / 1000) {
    return {
      error: `contest ${name} has already ended`
    }
  }

  if (startDate > Date.now() / 1000) {
    return {
      error: `contest ${name} hasn't started yet`
    }
  }
}

const getModulesV1 = (inScopeParagraph: string[], contest: string): Either<string, ContestModule[]> => {
  /**
   -   src/
    -   ProxyFactory.sol
    -   Distributor.sol
    -   Proxy.sol
   */

  // parsing logic: find the tabbings to get the directories.
  // if the line ends with .sol, then it's a module

  let modules = [] as ContestModule[]
  let currentFolder = ""

  for (let line of inScopeParagraph) {
    if (line.toLowerCase().includes("all") && line.toLowerCase().includes("in") && line.toLowerCase().includes("src")) {
      Logger.info("v1: !! all sol files in src are in scope")
      break
    }

    let { module, currentDir } = findModuleFromUl(line, inScopeParagraph, currentFolder, contest)
    currentFolder = currentDir

    if (module) modules.push(module)
  }

  if (modules.length === 0) return E.left(`no modules found for ${contest}`)

  return E.right(modules)
}

const findModuleFromUl = (line: string, lines: string[], currentDir: string, repo: string) => {
  let module: ContestModule | undefined = undefined

  try {
    let isRootDir = line.startsWith("- ")

    if (isRootDir) return { module, currentDir: line.replace("- ", "").trim() }

    let isModule = line.endsWith(".sol")

    if (isModule) {
      let name = line.replace("- ", "").trim()
      let path = `${currentDir}/${name}`.replace("//", "/")

      module = {
        name: name!!,
        path: path,
        url: "",
        contest: repo,
        active: 1,
      }
    }
  } catch (e) {
    console.log(`failed to parse line ${line}`)
  }

  return { module, currentDir }
}

export const getModulesV2 = (inScopeParagraph: string[], contest: string, repo: string): Either<string, ContestModule[]> => {
  /**
    - [ ] libraries/AppStorage.sol
    - [ ] libraries/DataTypes.sol (struct packing for storage types)
    - [ ] facets/AskOrdersFacet.sol
   */

  let modules = [] as ContestModule[]

  for (let i = 0; i < inScopeParagraph.length; ++i) {
    let line = inScopeParagraph[i]

    let module = getModuleFromFullPathLine(line, contest, repo)
    if (module) modules.push(module)
  }

  if (modules.length === 0) return E.left(`no modules found for ${contest}`)

  return E.right(modules)
}

export const getModuleFromFullPathLine = (line: string, contest: string, repo: string) => {
  if (!line.includes(".sol")) return undefined

  let words = line.split(" ")
  let path = words.find(it => it.includes(".sol"))?.trim()

  if (!path) return undefined

  let module: ContestModule = {
    name: path.split("/").pop()!!,
    path: path,
    url: `${repo}/${path}`,
    contest: contest,
    active: 1,
  }

  return module
}

const getBeforeScopeAndInScopeParagraph = (readme: string[]) => {
  let inScopeParagraph = [] as string[]
  let beforeScopeParagraph = [] as string[]

  let afterInScope = false

  for (let line of readme) {
    if (!afterInScope) {
      beforeScopeParagraph.push(line)

      if (line.toLowerCase().includes("scope") &&
        line.toLowerCase().includes("# ")) afterInScope = true
      continue
    }

    if (line.toLowerCase().includes("not in scope") || line.toLowerCase().includes("out of scope") || line.startsWith("#")) {
      break
    }
    else {
      inScopeParagraph.push(line)
    }
  }

  return { inScopeParagraph, beforeScopeParagraph }
}

const findDocUrls = (beforeScopeLines: string[]) => {
  let docUrls = [] as string[]
  let heading = ""

  for (let line of beforeScopeLines) {
    let newHeading = getMdHeading(line)
    if (newHeading) heading = newHeading

    let newDocs = findDocUrl(line, heading)
    if (newDocs.length > 0) docUrls = docUrls.concat(newDocs)
  }

  return docUrls
}

const getReadmeFromGithub = async (contest: string) => {
  let baseUrl = `https://raw.githubusercontent.com/Cyfrin/${contest}/main`

  let readme = await fetch(`${baseUrl}/README.md`).catch((e) => {
    return undefined
  }).then(async it => {
    return it?.text()
  })

  if (readme) return readme

  Logger.info(`no readme found for ${contest}`)
  return undefined
}

function getStartEndDate(readme: string[]): { startDate: any; endDate: any } {
  let startDate = 0
  let endDate = 0

  for (let line of readme) {
    /**
    - Starts August 21, 2023
    - Ends August 28th, 2023
     */
    if (line.startsWith("- Starts")) {
      let date = line.split("Starts")[1].trim().replace(/(th|st|nd|rd),/, ',')
      startDate = getTimestamp(date)

      if (isNaN(startDate)) startDate = 0
    }
    else if (line.startsWith("- Ends")) {
      let date = line.split("Ends")[1].trim().replace(/(th|st|nd|rd),/, ',')
      endDate = getTimestamp(date)
      if (isNaN(endDate)) endDate = 0
    }
  }
  if (startDate === 0 || endDate === 0) sentryError(`no start or end date found for ${readme}`)

  return { startDate, endDate }
}

const getTimestamp = (date: string) => {
  // August 21, 2023   
  var someDate = new Date(date);
  return someDate.getTime() / 1000;
}
