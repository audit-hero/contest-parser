import { sentryError, ContestModule, ContestWithModules, Repo } from "ah-shared"
import { findDocUrl, findTags, getAllRepos, getAnyDateTimestamp, getContestStatus, getMdHeading, logTrace } from "../util"
import Logger from "js-logger"
import E from "fp-ts/lib/Either"
import T from "fp-ts/lib/Task"
import TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function.js"
import anyDate from "any-date-parser"
import { parseTreeModulesV2 } from "../parse-modules.js"

export const parseActiveCodeHawksContests = async (existingContests: ContestWithModules[]): Promise<ContestWithModules[]> => {
  let possibleActive = await getPossiblyActiveContests()
  
  // possibleActive = possibleActive.filter(it => it.name.includes("2023-12-stake-link"))

  let active = await parseReposJobs(possibleActive, existingContests)
  return active.filter(it => it !== undefined) as ContestWithModules[]
}

export const getPossiblyActiveContests = async (): Promise<Repo[]> => {
  let repos = await getAllRepos("Cyfrin")

  logTrace(() => `got ${repos.map(it => JSON.stringify(it)).join("\n")}`)

  let contestRepos = repos.filter((it: { name: string }) => {
    return it.name.match(new RegExp("^\\d{4}-\\d{2}-.*$")) !== null
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

const getModulesFromTree = (inScopeParagraph: string[], name: string, url: string): E.Either<string, ContestModule[]> => {
  let modules = parseTreeModulesV2(inScopeParagraph)

  if (modules.length === 0) return E.left(`no modules found for ${name}`)

  return E.right(modules.map(it => {
    return {
      name: it.split("/").pop()!!,
      path: it,
      url: `${url}/${it}`,
      contest: name,
      active: 1,
    } as ContestModule
  }))
}

export const parseContest =

  async (name: string, url: string, readme: string): Promise<E.Either<string, ContestWithModules>> => {
    let split = readme.split("\n")

    let { startDate, endDate } = getStartEndDate(split)

    let dateError = getDatesError(startDate, endDate, name)
    if (dateError) return Promise.resolve(E.left(dateError.error))

    let hmAwards = getHmAwards(split, name)

    let { inScopeParagraph, beforeScopeParagraph } = getBeforeScopeAndInScopeParagraph(split)

    let docUrls = findDocUrls(beforeScopeParagraph)

    let modules = await pipe(
      getModulesV1(inScopeParagraph, name, url),
      // E.Either<string, ContestModule[]>
      E.orElse(() => getModulesV2(inScopeParagraph, name, url)),
      E.orElse(() => getModulesFromTree(inScopeParagraph, name, url)),
      // TE.TaskEither<string, ContestModule[]>
      TE.fromEither,
      // verify module urls
      TE.mapLeft(it => ({ modules: [], error: it })),
      // now have Modules with possibly wrong urls. try and verify urls from readme
      TE.chain(verifyUrls),
      //if there is an error with verifying urls, then try to map the correct prefix
      TE.orElse((e) => tryMapCorrectPrefix(url, e.modules)),
      TE.getOrElse(
        (e) => {
          sentryError(e, `failed to parse ${name} modules`, "daily")
          return T.of([] as ContestModule[])
        },
      )
    )()

    let tags = findTags(split)

    let result: ContestWithModules = {
      pk: name,
      sk: "0",
      readme: readme,
      url: `https://www.codehawks.com/contests`,
      start_date: startDate,
      end_date: endDate,
      platform: "codehawks",
      active: 1, // end_date > now
      status: getContestStatus({ startDate, endDate }),
      prize: `${hmAwards}$`,
      loc: modules.map(it => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
      modules: modules,
      all_modules: modules,
      doc_urls: docUrls,
      repo_urls: [url],
      tags: tags
    }

    return Promise.resolve(E.right(result))
  }

let verifyUrls = (modules: ContestModule[]): TE.TaskEither<{ modules: ContestModule[], error: string }, ContestModule[]> => {
  const left = (error: string) => TE.left({
    modules: modules,
    error: error
  })

  if (modules.length === 0 || !modules[0].url) return left("no modules found")

  return pipe(
    () => fetch(modules[0].url!),
    TE.fromTask,
    TE.chain(
      (it) => {
        if (it.status === 404) return left("wrong url")
        return TE.right(modules)
      }
    ),
  )
}

const mapPrefix = (prefix: string) => (modules: ContestModule[]): ContestModule[] => {
  return modules.map(it => {
    return {
      ...it,
      url: `${prefix}${it.path}`
    }
  })
}

const tryMapCorrectPrefix = (repo: string, modules: ContestModule[]): TE.TaskEither<string, ContestModule[]> => {
  // add src/contracts prefix to the url if it doesn't exist. if still can't find the module, then
  if (modules.length === 0 || !modules[0].url) return TE.left(`no modules found for ${repo}`)

  let rawUrl = repo.replace("github.com", "raw.githubusercontent.com")

  let prefixes = [
    `${rawUrl}/main/`,
    `${rawUrl}/main/src/`,
    `${rawUrl}/main/src/contracts/`,
    `${rawUrl}/main/contracts/`,
  ]

  const isPrefixValid = async (prefix: string): Promise<string | undefined> => {
    let res = await fetch(`${prefix}${modules[0].path}`)
    if (res && res.status !== 404) return prefix
    return undefined
  }

  let jobs = () => Promise.all(prefixes.map(it => isPrefixValid(it)))

  let res = pipe(
    jobs,
    T.map(it =>
      it.find(it => it !== undefined)
    ),
    TE.fromTask,
    TE.chain(it => {
      if (it) return TE.right(it)
      return TE.left("no valid prefix found")
    }),
    TE.map(it => mapPrefix(it)(modules))
  )

  return res
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
    if (line.toLowerCase().includes("awards")) {
      let split = line.split(":")
      if (split.length < 2) continue
      let amount = split[1].trim()
      hmAwards = parseInt(amount.replace("$", "").replace(",", ""))
      break
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

const getModulesV1 = (inScopeParagraph: string[], contest: string, repoUrl: string): E.Either<string, ContestModule[]> => {
  if (inScopeParagraph.some(it => it.includes("├"))) {
    return E.left("tree modules")
  }

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

    let { module, currentDir } = findModuleFromUl(line, inScopeParagraph, currentFolder, contest, repoUrl)
    currentFolder = currentDir

    if (module) modules.push(module)
  }

  if (modules.length === 0) return E.left(`no modules found for ${contest}`)

  return E.right(modules)
}

const findModuleFromUl = (line: string, lines: string[], currentDir: string, repo: string, repoUrl: string) => {
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
        url: `${repoUrl}/${path}`,
        contest: repo,
        active: 1,
      }
    }
  } catch (e) {
    console.log(`failed to parse line ${line}`)
  }

  return { module, currentDir }
}

export const getModulesV2 = (inScopeParagraph: string[], contest: string, repo: string): E.Either<string, ContestModule[]> => {
  if (inScopeParagraph.some(it => it.includes("├"))) {
    return E.left("tree modules")
  }
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

    if (line.toLowerCase().includes("not in scope") || line.toLowerCase().includes("out of scope") || (line.startsWith("#") && !line.includes("in scope"))) {
      break
    }
    else {
      if (line.startsWith("#")) continue
      inScopeParagraph.push(line)
    }
  }

  return { inScopeParagraph, beforeScopeParagraph }
}

const findDocUrls = (beforeScopeLines: string[]) => {
  let docUrls = [] as string[]
  let headings = [] as string[]

  for (let line of beforeScopeLines) {
    getMdHeading(line, headings)

    let newDocs = findDocUrl(line, headings)
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

let dateSplitWords = [
  "- starts -",
  "- ends - ",
  "- starts:",
  "- starts",
  "- start:",
  "- start",
  "- ends:",
  "- ends",
  "- end:",
  "- end",
]

function getStartEndDate(readme: string[]): { startDate: any; endDate: any } {
  let startDate = 0
  let endDate = 0

  for (let line of readme) {
    line = line.toLowerCase()
    /**
    - Starts August 21, 2023
    - Ends August 28th, 2023
     */

    dateSplitWords.forEach(it => {
      if (line.includes(it)) {
        let split = line.split(it)
        if (split.length < 2) return

        let trimmed = pipe(
          split[1].trim(),
          replaceNoonLine,
          replaceUtc
        )
        
        let date = anyDate.attempt(trimmed)
        if (date.invalid) return

        if (it.includes("start")) startDate = getAnyDateTimestamp(date)
        else endDate = getAnyDateTimestamp(date)
      }
    })
  }
  if (startDate === 0 || endDate === 0) sentryError(`no start or end date found for ${readme}`)

  return { startDate, endDate }
}


let replaceNoonLine = (date:string) => {
  // convert December 27, 2023 Noon UTC to December 27, 2023 12:00 UTC
  return date.replace("noon utc", "12:00 utc")
}

let replaceUtc = (date:string) => {
  return date.replace(/(utc|gmt)/, '')
}
