import { ContestModule, ContestWithModules, Status } from "ah-shared"
import { findDocUrl, findTags, trimContestName } from "../util.js"
import { ImmunefiContest, isActive } from "./types.js"
import { scrape } from "../web-load/playwright-loader.js"

export const parseContest = async (
  contest: ImmunefiContest
): Promise<ContestWithModules> => {
  // can get more info from contest sub page later
  // let md = await downloadContestAsMd(contest) 
  return parseMd(contest)
}

let downloadContestAsMd = async (contest: ImmunefiContest): Promise<string> => {
  let url = `https://immunefi.com/boost/${contest.id}`
  let md = (await scrape(url, [])).content
  if (md.match(/\n#\s/)) md = md.split(/\n#\s/)[1]

  return md
}

export const parseMd = (mdContest: ImmunefiContest): ContestWithModules => {
  let { start_date, end_date } = getStartEndDate(mdContest)

  let active = isActive(mdContest) ? 1 : 0
  let modules = [] as ContestModule[]

  let contest: ContestWithModules = {
    pk: trimContestName(mdContest.id, start_date),
    readme: mdContest.boostedIntroStartingIn,
    start_date: start_date,
    end_date: end_date,
    platform: "immunefi",
    sk: "0",
    url: `https://immunefi.com/boost/${mdContest.id}`,
    active: active,
    status: mdStatusToStatus({ start_date, end_date }),
    modules: modules,
    doc_urls: [],
    prize: `${mdContest.rewardsPool} ${mdContest.rewardsToken}`,
    tags: findTags(mdContest.boostedIntroStartingIn.split("\n")),
  }

  return contest
}

let mdStatusToStatus = ({
  start_date,
  end_date,
}: {
  start_date: number
  end_date: number
}): Status => {
  let date = new Date().getTime() / 1000
  if (date < start_date) return "created"
  if (date < end_date) return "active"
  return "finished"
}

let getModulesStartIndex = (lines: string[]) => {
  let modulesStart = lines.findIndex(
    (it) =>
      it.includes("# ") &&
      it.toLowerCase().includes("scope") &&
      !it.toLowerCase().includes("out of scope")
  )

  if (modulesStart === -1) {
    modulesStart = lines.findIndex(
      (it) => it.includes("# ") && it.toLowerCase().includes(" contracts")
    )
  }

  return modulesStart
}

const findModules = (
  contest: string,
  lines: string[],
  active: number
): ContestModule[] => {
  let modulesStart = getModulesStartIndex(lines)

  let modulesEnd = lines.findIndex((it, index) => {
    return index > modulesStart && it.startsWith("** ")
  })
  if (modulesEnd === -1) modulesEnd = lines.length
  if (modulesStart === -1) return []
  modulesStart += 1

  let modules = [] as ContestModule[]
  for (let i = modulesStart; i < modulesEnd; ++i) {
    let line = lines[i]
    let isUrl = line.startsWith("* [https://")

    if (!isUrl) continue

    let url = line
      .replace("* [", "")
      .split("](")[1]
      .split(' "')[0]
      .replace("?utm%5Fsource=immunefi", "")

    let module: ContestModule = {
      name: url.split("/").pop()!,
      contest: contest,
      active: active,
      path: url.split("/").pop()!,
      url,
    }

    modules.push(module)
  }

  return modules
}

const findDocUrls = (lines: string[]) => {
  let docUrls = [] as string[]
  let docLinesEnd = lines.findIndex((it) => it.startsWith("## Scope"))

  for (let i = 0; i < docLinesEnd; ++i) {
    let line = lines[i]

    let newUrls = findDocUrl(line, ["about"])
    docUrls.push(...newUrls)
  }

  return docUrls
}

function getStartEndDate(contest: ImmunefiContest): {
  start_date: number
  end_date: number
} {
  let start_date = new Date(contest.launchDate).getTime() / 1000
  let end_date = new Date(contest.endDate).getTime() / 1000

  return { start_date, end_date }
}
