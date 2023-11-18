import axios from "axios"
import Logger from "js-logger"
import { sentryError, Result } from "ah-shared"
import { ContestWithModules, ContestModule, Tag, Status } from "ah-shared"
import { getRepoNameFromUrl, findTags } from "../util"
import { SherlockContest } from "../types.js"
import { findModules } from "./modules.js"

let sherlockContestsUrl = "https://mainnet-contest.sherlock.xyz/contests"

export const parseActiveSherlockContests = async (
  existingContests: ContestWithModules[]
): Promise<ContestWithModules[]> => {
  let active = await getActiveSherlockContests()
  let res = await Promise.all(parseSherlockContests(active, existingContests))
  return res.filter((it) => it !== undefined) as ContestWithModules[]
}

export const parseSherlockContests = (
  contests: SherlockContest[],
  existingContests: ContestWithModules[]
) => {
  let jobs = [] as Promise<ContestWithModules | undefined>[]

  for (let i = 0; i < contests.length; ++i) {
    let contestExists = existingContests.find(
      (it) => it.pk === getRepoNameFromUrl(contests[i].template_repo_name)
    )

    if (contestExists && contestExists.modules.length > 0) {
      Logger.info(`contest ${contests[i].title} already exists, skipping`)
      continue
    } else {
      if (contests[i].ends_at < Date.now() / 1000) {
        Logger.info(`contest ${contests[i].title} has already ended, skipping`)
        continue
      }
      Logger.info(`contest ${contests[i].title} doesn't exist, parsing`)
    }

    let contest = parseSherlockContest(contests[i])
      .then((it) => {
        if (!it.ok) {
          sentryError(
            it.error,
            `failed to parse sherlock contest ${contests[i].title}`,
            "daily"
          )
        } else {
          return it.value
        }
      })
      .catch((e) => {
        sentryError(
          e,
          `failed to parse sherlock contest ${contests[i].title}`,
          "daily"
        )
        return undefined
      })

    jobs.push(contest)
  }

  return jobs
}

export const getActiveSherlockContests = async (): Promise<
  SherlockContest[]
> => {
  // get 2 pages
  let builder: SherlockContest[] = []

  for (let i = 0; i < 2; ++i) {
    let url = `${sherlockContestsUrl}?page=${i + 1}`
    let contests: SherlockContest[] = await axios
      .get(url)
      .then((it) => {
        return it.data.items as SherlockContest[]
      })
      .catch((e) => {
        console.log(`error ${e}`)
        sentryError(e, "failed to fetch sherlock contests")
        return []
      })

    builder = builder.concat(contests)
  }

  return builder.filter((it) => it.status !== "FINISHED")
}

const getReadmeFromGithub = async (contest: string) => {
  let baseUrl = `https://raw.githubusercontent.com/sherlock-audit/${contest}/main`

  let readme = await axios
    .get(`${baseUrl}/README.md`)
    .catch((e) => {
      return undefined
    })
    .then((it) => {
      return it?.data as string
    })

  if (readme)
    return {
      main: readme,
      baseUrl: baseUrl,
    }

  baseUrl = `https://raw.githubusercontent.com/sherlock-audit/${contest}/master`

  readme = await axios
    .get(`${baseUrl}/README.md`)
    .catch((e) => {
      return undefined
    })
    .then((it) => {
      return it?.data as string
    })

  if (readme) return { master: readme, baseUrl: baseUrl }

  Logger.info(`no readme found for ${contest}`)
  return undefined
}

export const parseSherlockContest = async (
  contest: SherlockContest
): Promise<Result<ContestWithModules>> => {
  // let githubLink = contest.repo
  let jsonUrl = `${sherlockContestsUrl}/${contest.id}`
  let contestDetails = await axios
    .get(jsonUrl, { headers: { "Content-Type": "application/json" } })
    .catch((e) => {
      console.log(`error ${e}`)
      return undefined
    })
    .then((it) => {
      return it?.data as SherlockContest
    })

  let name = getRepoName(contestDetails)

  let readmeObj = await getReadmeFromGithub(name)

  let nonParsedDetails = {
    pk: name,
    sk: "0",
    url: `https://app.sherlock.xyz/audits/contests/${contest.id}`,
    start_date: contest.starts_at,
    end_date: contest.ends_at,
    platform: "sherlock",
    active: 1, // end_date > now
    status: sherlockStatusToStatus(contest.status),
    prize: `${contest.prize_pool}$`,
  }

  if (!readmeObj) {
    let now = Math.floor(Date.now() / 1000)
    if (contest.starts_at < now) {
      return {
        ok: false,
        error: `no readme found for ${contest}`,
      }
    } else {
      return {
        ok: true,
        value: {
          ...nonParsedDetails,
          modules: [],
          tags: [],
        },
      } as any
    }
  }

  let readme
  if (readmeObj.main) readme = readmeObj.main
  else readme = readmeObj.master

  let modules = [] as ContestModule[]
  let repos = [] as string[]
  let tags = [] as Tag[]
  let docUrls = [] as string[]

  if (readme) {
    let lines = readme.split("\n")

    let { modules: modulesFromReadme, docUrls: docUrlsFromReadme } =
      findModules({
        lines,
        contest,
        name,
        repos,
        readmeObj,
      })

    modules = modulesFromReadme
    docUrls = docUrlsFromReadme

    tags = findTags(lines)
  }

  if (modules.length === 0) sentryError(`no modules found for ${name}`)

  return {
    ok: true,
    value: {
      ...nonParsedDetails,
      readme: String(readme),
      loc: modules.map((it) => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
      modules: modules,
      doc_urls: docUrls,
      repo_urls: repos,
      tags: tags,
    },
  }
}

const getRepoName = (contest: SherlockContest) => {
  let split = contest.template_repo_name.split("/")
  if (split[split.length - 1] === "") split.pop()
  let name = split.pop()!!
  return name
}

const sherlockStatusToStatus = (status: SherlockContest["status"]): Status => {
  switch (status) {
    case "CREATED":
      return "created"
    case "FINISHED":
      return "finished"
    case "SHERLOCK_JUDGING":
    case "JUDGING":
      return "judging"
    case "RUNNING":
      return "active"
    default:
      sentryError(`unknown status ${status}`)
      return "active"
  }
}
