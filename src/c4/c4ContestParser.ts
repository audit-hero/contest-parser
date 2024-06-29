import axios from "axios"
import { Logger } from "jst-logger"
import { findTags, trimContestName } from "../util.js"
import { C4Contest } from "../types.js"
import { sentryError } from "ah-shared"
import { ContestWithModules, Tag, ContestModule, Status } from "ah-shared"
import { Result } from "ah-shared"
import { getTimestamp, findModules, getHmAwards } from "./parse-utils.js"
import { getActiveC4Contests } from "./getActiveC4Contests.js"
import { pipe } from "fp-ts/lib/function.js"
import * as E from "fp-ts/lib/Either.js"
import * as TE from "fp-ts/lib/TaskEither.js"

export const parseActiveC4Contests = async (
  existingContests: ContestWithModules[]
): Promise<ContestWithModules[]> => {
  let active = await getActiveC4Contests()

  let res = await pipe(
    active,
    TE.fromEither,
    TE.chain((it) =>
      TE.tryCatch(
        () => Promise.all(parseC4Contests(it, existingContests)),
        E.toError
      )
    ),
    TE.map((it) => it.filter((it) => it !== undefined) as ContestWithModules[]),
    TE.mapLeft((it) => {
      sentryError("error parsing c4 contests", it)
      return it
    }),
    TE.toUnion
  )()

  return res instanceof Error ? [] : res
}

export const parseC4Contests = (
  contests: C4Contest[],
  existingContests: ContestWithModules[]
) => {
  let jobs = [] as Promise<ContestWithModules | undefined>[]

  for (let i = 0; i < contests.length; ++i) {
    let contestExists = existingContests.find(
      (it) => it.pk === contests[i].trimmedSlug
    )

    if (contestExists && contestExists.modules.length > 0) {
      Logger.info(`${contests[i].title} already exists, skipping`)
      continue
    }

    let contest = parseC4Contest(contests[i])
      .then((it) => {
        if (!it.ok)
          sentryError(
            it.error,
            `failed to parse c4 contest ${contests[i].title}`
          )
        else return it.value
      })
      .catch((err) => {
        sentryError(err, `error parsing c4 contest ${contests[i].title}`)
        return undefined
      })

    jobs.push(contest)
  }

  return jobs
}

export const parseC4Contest = async (
  contest: C4Contest
): Promise<Result<ContestWithModules>> => {
  Logger.info(`start parsing ${contest.slug}`)

  let url = `https://code4rena.com/audits/${contest.slug}`
  // try to get the raw README.md from either main or master branch
  // input: https://github.com/code-423n4/2022-09-quickswap
  let githubLink = contest.repo

  let urlSplit = githubLink.split("/")
  let repo = urlSplit[urlSplit.length - 1]
  let org = urlSplit[urlSplit.length - 2]

  let branches = ["main", "master"]
  let readmeRaw: string | undefined
  for (let branch of branches) {
    if (readmeRaw) break

    let rawUrl = `https://raw.githubusercontent.com/${org}/${repo}/${branch}/README.md`

    await axios
      .get(rawUrl)
      .catch((e) => {
        console.log(
          `Can't get repo ${rawUrl} (prolly private or upcoming) ${e}`
        )
      })
      .then((it) => {
        readmeRaw = it?.data
      })
  }

  // parse the md file
  let result = parseMd(url, readmeRaw, repo, contest)
  return result
}

// sorted desc
export const parseMd = (
  url: string,
  readme: string | undefined,
  repo: string,
  contest: C4Contest
): Result<ContestWithModules> => {
  // find lines that start with "|[src"
  let tags = [] as Tag[]
  let start_date = getTimestamp(contest.start_time),
    end_date = getTimestamp(contest.end_time)
  let modules = [] as ContestModule[]
  let docUrls = [] as string[]
  let hmAwards = trimContestAmount(contest.amount)

  if (readme) {
    let lines = readme.split("\n")

    let modulesResult = findModules(repo, lines, 0)
    modules = modulesResult.modules
    docUrls = modulesResult.docUrls

    hmAwards = getHmAwards(contest, lines)

    tags = findTags(lines)
  } else {
    console.log("Warning: Private contest")
  }

  let status: Status = "active"
  if (Math.floor(Date.now() / 1000) < start_date) status = "created"

  return {
    ok: true,
    value: {
      pk: trimContestName(contest.trimmedSlug, start_date),
      sk: "0",
      url: url,
      readme: readme ?? "",
      start_date: start_date,
      end_date: end_date,
      platform: "c4",
      active: 1,
      status: status,
      prize: hmAwards,
      loc: modules.map((it) => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
      modules: modules,
      doc_urls: docUrls,
      repo_urls: [repo],
      tags: tags,
    },
  }
}

let usdCoins = ["USDC", "USDT", "DAI", "TUSD", "BUSD", "USDP", "UST"]
export let trimContestAmount = (amount: string) => {
  amount = amount.replace("$$", "$").replace(" in ", " ")

  if (usdCoins.some((it) => amount.includes(it))) {
    amount = amount.replace("$", "").replace(" ", "")
    usdCoins.forEach((it) => {
      amount = amount.replace(it, "")
    })
    amount = amount + " $"
  }

  return amount
}
