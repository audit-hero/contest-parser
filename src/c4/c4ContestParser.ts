import { Logger } from "jst-logger"
import { findTags, getHtmlAsMd, trimContestName } from "../util.js"
import { C4Contest } from "../types.js"
import { sentryError } from "ah-shared"
import { ContestWithModules, Tag, ContestModule, Status } from "ah-shared"
import { Result } from "ah-shared"
import { convertToResult, findModules } from "./parse-utils.js"
import { getActiveC4Contests } from "./getActiveC4Contests.js"
import { pipe } from "fp-ts/lib/function.js"
import * as E from "fp-ts/lib/Either.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import { NO_REPO_FOUND, NO_START_END, parseHeaderBullets } from "./parseHeaderBullets.js"
import * as O from "fp-ts/lib/Option.js"
import { trim } from "fp-ts/lib/string.js"

export const parseActiveC4Contests = async (
  existingContests: ContestWithModules[],
): Promise<ContestWithModules[]> => {
  let active = await getActiveC4Contests()

  let res = await pipe(
    active,
    TE.fromEither,
    TE.chain((it) =>
      TE.tryCatch(() => Promise.all(parseC4Contests(it, existingContests)), E.toError),
    ),
    TE.map((it) => it.filter((it) => it !== undefined) as ContestWithModules[]),
    TE.mapLeft((it) => {
      sentryError("error parsing c4 contests", it)
      return it
    }),
    TE.toUnion,
  )()

  return res instanceof Error ? [] : res
}

export const parseC4Contests = (contests: C4Contest[], existingContests: ContestWithModules[]) => {
  let jobs = [] as Promise<ContestWithModules | undefined>[]

  for (let i = 0; i < contests.length; ++i) {
    let contestExists = existingContests.find((it) => it.pk === contests[i].trimmedSlug)

    if (contestExists && contestExists.modules.length > 0) {
      Logger.info(`${contests[i].slug} already exists, skipping`)
      continue
    }

    let contest = parseC4Contest(contests[i])
      .then((it) => {
        if (!it.ok) {
          if (it.error.message !== NO_START_END && it.error.message !== NO_REPO_FOUND)
            sentryError(it.error, `failed to parse c4 contest ${contests[i].slug}`)
        } else return it.value
      })
      .catch((err) => {
        sentryError(err, `error parsing c4 contest ${contests[i].slug}`)
        return undefined
      })

    jobs.push(contest)
  }

  return jobs
}

export const parseC4Contest = async (contest: C4Contest): Promise<Result<ContestWithModules>> =>
  await pipe(
    () => Logger.info(`start parsing ${contest.slug}`),
    () => parseC4ContestEither(contest),
    convertToResult(contest),
  )()

let parseC4ContestEither = (contest: C4Contest) =>
  pipe(
    TE.tryCatch(() => getHtmlAsMd(`https://code4rena.com/audits/${contest.slug}`), E.toError),
    TE.chain((fullPageMd) =>
      pipe(
        E.Do,
        E.bind("githubMd", () => E.right(trimPageToMd(fullPageMd))),
        E.bind("repo", () => getRepo(fullPageMd, contest.trimmedSlug)),
        E.chain(({ githubMd, repo }) => parseMd(contest, repo, githubMd)),
        TE.fromEither,
      ),
    ),
  )

let trimPageToMd = (md: string) => {
  let end = "* An open organization\n* ["
  let startIndex = md.match(/^#.*audit details.*/m)?.index ?? 0
  let endIndex = md.indexOf(end)
  let trimmed = md.slice(startIndex, endIndex)
  return trimmed
}

export const parseMd = (
  contest: C4Contest,
  repo: string,
  // starting from "audit details"
  contestMd: string,
): E.Either<Error, ContestWithModules> =>
  pipe(
    E.Do,
    E.apS("bulletPoints", parseHeaderBullets(contestMd)),
    E.chain(({ bulletPoints }) => {
      let { hmAwards, start: start_date, end: end_date } = bulletPoints

      let tags = [] as Tag[]
      let modules = [] as ContestModule[]
      let docUrls = [] as string[]
      let lines = contestMd.split("\n")

      let modulesResult = findModules(repo, lines, 0)
      modules = modulesResult.modules
      docUrls = modulesResult.docUrls

      tags = findTags(lines)

      let status: Status = "active"
      if (Math.floor(Date.now() / 1000) < start_date) status = "created"

      return E.of({
        pk: trimContestName(contest.trimmedSlug, start_date),
        sk: "0",
        url: `https://code4rena.com/audits/${contest.slug}`,
        readme: contestMd ?? "",
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
      })
    }),
  )

let getRepo = (md: string, trimmedSlug: string) => {
  // [![edit](/icon/GitHub/16.svg)View Repo](https://github.com/code-423n4/2024-06-size) [Submit finding](/audits/2024-06-size/submit)
  return pipe(
    O.fromNullable(md.match(/View Repo\]\((.*?)\)/)),
    O.chain((it) => O.fromNullable(it.at(1))),
    E.fromOption(() => {
      Logger.debug(`no repo found in readme for ${trimmedSlug}`)
      return new Error(NO_REPO_FOUND)
    }),
  )
}
