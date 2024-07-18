import axios from "axios"
import { Logger } from "jst-logger"
import { sentryError, Result } from "ah-shared"
import { ContestWithModules, ContestModule, Tag, Status } from "ah-shared"
import { findTags, getReadmeFromGithub, trimContestName } from "../util.js"
import { SherlockContest } from "../types.js"
import { findModules } from "./modules.js"
import chalk from "chalk"

let sherlockContestsUrl = "https://mainnet-contest.sherlock.xyz/contests"

export const parseActiveSherlockContests = async (
  existingContests: ContestWithModules[],
): Promise<ContestWithModules[]> => {
  let active = await getActiveSherlockContests()
  let res = await Promise.all(parseSherlockContests(active, existingContests))
  return res.filter((it) => it !== undefined) as ContestWithModules[]
}

export const parseSherlockContests = (
  contests: SherlockContest[],
  existingContests: ContestWithModules[],
) => {
  let jobs = [] as Promise<ContestWithModules | undefined>[]

  for (let i = 0; i < contests.length; ++i) {
    let job = downloadDetails(contests[i]).then(async (details) => {
      if (contests[i].ends_at < Date.now() / 1000) {
        Logger.debug(chalk.yellow(`contest ${contests[i].title} has already ended, skipping`))
        return undefined
      }
      Logger.info(chalk.green(`contest ${contests[i].title} doesn't exist, parsing`))

      let contest = parseSherlockContest(details)
        .then((it) => {
          if (!it.ok) {
            sentryError(it.error, `failed to parse sherlock contest ${contests[i].title}`, "daily")
          } else {
            return it.value
          }
        })
        .catch((e) => {
          sentryError(e, `failed to parse sherlock contest ${contests[i].title}`, "daily")
          return undefined
        })

      return contest
    })

    jobs.push(job)
  }

  return jobs
}

let downloadDetails = async (contest: SherlockContest) => {
  // let githubLink = contest.repo
  let jsonUrl = `${sherlockContestsUrl}/${contest.id}`
  let contestDetails = await axios
    .get(jsonUrl, { headers: { "Content-Type": "application/json" } })
    .catch((e) => {
      console.log(`error ${e}`)
      return undefined
    })
    .then((it) => {
      return it?.data as Required<SherlockContest>
    })

  return contestDetails
}

export const getActiveSherlockContests = async (): Promise<SherlockContest[]> => {
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

export const parseSherlockContest = async (
  contest: Required<SherlockContest>,
): Promise<Result<ContestWithModules>> => {
  let name = getRepoName(contest)
  let readmeObj = await getReadmeFromGithub("sherlock-audit", name)

  let nonParsedDetails = {
    pk: trimContestName(name, contest.starts_at),
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
    if (contest.ends_at < now) {
      return {
        ok: false,
        error: `already ended ${contest}`,
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

  let readme = readmeObj.readme

  let modules = [] as ContestModule[]
  let repos = [] as string[]
  let tags = [] as Tag[]
  let docUrls = [] as string[]

  if (readme) {
    let lines = readme.split("\n")

    let { modules: modulesFromReadme, docUrls: docUrlsFromReadme } = findModules({
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

const getRepoName = (contest: Required<SherlockContest>) => {
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
