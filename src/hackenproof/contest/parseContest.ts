import { ContestModule, ContestWithModules, Status } from "ah-shared"
import { trimContestName } from "../../util.js"

import { HackenproofContest, HackenproofContestStatus } from "../list/parseNuxt.js"

export const parseContest = async (contest: HackenproofContest): Promise<ContestWithModules> => {
  return convertContest(contest)
}

export const convertContest = (contest: HackenproofContest): ContestWithModules => {
  let name = contest.slug

  let startDate = new Date(contest.startDate).getTime() / 1000
  let endDate = new Date(contest.endDate).getTime() / 1000
  let active = contest.status === "LIVE" ? 1 : 0
  let modules = [] as ContestModule[]

  let result: ContestWithModules = {
    pk: trimContestName(name, startDate),
    readme: contest.name + "\n\n" + contest.description,
    start_date: startDate,
    end_date: endDate,
    platform: "hackenproof",
    sk: "0",
    url: `https://hackenproof.com/audit-programs/${contest.slug}`,
    active: active,
    status: mdStatusToStatus(contest.status),
    modules: modules,
    doc_urls: [],
    prize: contest.reward,
    tags: [],
    repo_urls: [contest.repoUrl],
  }

  return result
}

let mdStatusToStatus = (status: HackenproofContestStatus): Status => {
  if (status === "LIVE") return "active"
  if (status === "ENDED") return "finished"

  throw new Error(`Unknown status: ${status}`)
}
