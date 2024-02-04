import { docHeadings, findDocUrl, findTags, getContestStatus } from "../util"
import Logger from "js-logger"
import { Project, Projects } from "./types"
import {
  Result,
  sentryError,
  ContestWithModules,
  ContestModule,
} from "ah-shared"
import { getModules } from "./hats-parser.modules.js"
import { getActiveContests } from "./getActiveContests"

export const parseActiveHatsContests = async (
  existingContests: ContestWithModules[]
): Promise<ContestWithModules[]> => {
  let active = await getActiveContests()
  let contests = await parseContests(active, existingContests)
  return contests.filter((it) => it !== undefined) as ContestWithModules[]
}

let hatsNameToContestName = (project: Project["project-metadata"]) => {
  let starttime = project.starttime
  let month = `${new Date(starttime * 1000).getMonth() + 1}`
  if (parseInt(month) < 10) month = `0${month}`
  let year = new Date(starttime * 1000).getFullYear()

  let name = `${year}-${month}-${project.name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("--", "-")
    .replaceAll("--", "-")
    .replaceAll("(", "")
    .replaceAll(")", "")}`
  return name
}

export const parseContests = async (
  contests: Project[],
  existingContests: ContestWithModules[]
) => {
  let jobs = [] as (ContestWithModules | undefined)[]

  for (let i = 0; i < contests.length; ++i) {
    let name = hatsNameToContestName(contests[i]["project-metadata"])
    let contestExists = existingContests.find((it) => it.pk === name)

    if (contestExists && contestExists.modules.length > 0) {
      Logger.info(`contest ${name} already exists, skipping`)
      continue
    }

    let contest = await parseContest(contests[i], name)
      .then((it) => {
        if (!it.ok) {
          sentryError(
            it.error,
            `failed to parse sherlock contest ${name}`,
            "daily"
          )
          return undefined
        }
        return it.value
      })
      .catch((e) => {
        sentryError(e, `failed to parse sherlock contest ${name}`, "daily")
        return undefined
      })

    jobs.push(contest)
  }

  return jobs
}

const parseContest = async (
  contest: Project,
  name: string
): Promise<Result<ContestWithModules>> => {
  let { startDate, endDate } = getStartEndDate(contest)
  let dateError = getDatesError(startDate, endDate, name)
  let inFuture = startDate > Date.now() / 1000
  if (dateError) return { ok: false, error: dateError.error }

  let hmAwards = contest["project-metadata"].intendedCompetitionAmount
    .replace("$", "")
    .replace(",", "")
    .replace(".", "")

  let docUrls = [] as string[]
  let modules = [] as ContestModule[]
  if (!inFuture) {
    if (contest.scope.docsLink)
      docUrls = [...findDocUrl(contest.scope.docsLink, docHeadings)]
    modules = await getModules(contest, name)
  }

  let tags = findTags(contest["project-metadata"].oneLiner.split("\n"))

  let baseUrl = "https://app.hats.finance/audit-competitions"
  let url = `${baseUrl}/${contest["project-metadata"].name.toLowerCase()}-${
    contest.id
  }`
  if (url.includes(" ")) url = url = baseUrl

  let result: ContestWithModules = {
    pk: name,
    sk: "0",
    readme: getReadme(contest),
    url: url,
    start_date: startDate,
    end_date: endDate,
    platform: "hats",
    active: 1, // end_date > now
    status: getContestStatus({ startDate, endDate }),
    prize: hmAwards,
    modules,
    doc_urls: docUrls,
    repo_urls: contest.scope.reposInformation.map((it) => it.url),
    tags: tags,
  }

  return { ok: true, value: result }
}

const getReadme = (contest: Project) => {
  let oneLiner = contest["project-metadata"].oneLiner
  let description = contest.scope.description
  let docsLink = contest.scope.docsLink
  let outOfScope = contest.scope.outOfScope
  let instructions = contest.scope.protocolSetupInstructions.instructions

  let oneLinerTitle = oneLiner ? `${oneLiner}` : ``
  let descriptionTitle = description ? `## Description\n\n${description}` : ``
  let docsLinkTitle = docsLink ? `## Docs\n\n${docsLink}` : ``
  let outOfScopeTitle = outOfScope ? `## Out of Scope\n\n${outOfScope}` : ``
  let instructionsTitle = instructions
    ? `## Instructions\n\n${instructions}`
    : ``

  let all = [
    oneLinerTitle,
    descriptionTitle,
    docsLinkTitle,
    outOfScopeTitle,
    instructionsTitle,
  ]

  return all.filter((it) => it !== "").join("\n\n")
}

export const getDatesError = (
  startDate: number,
  endDate: number,
  name: string
) => {
  if (endDate < Date.now() / 1000) {
    return {
      error: `contest ${name} has already ended`,
    }
  }

  /* if (startDate > Date.now() / 1000) {
    return {
      error: `contest ${name} hasn't started yet`
    }
  } */
}

function getStartEndDate(contest: Project): {
  startDate: number
  endDate: number
} {
  let startTime = contest["project-metadata"].starttime
  let endTime = contest["project-metadata"].endtime

  return { startDate: startTime, endDate: endTime }
}
