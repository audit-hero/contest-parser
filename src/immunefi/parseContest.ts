import { ContestModule, ContestWithModules, Status } from "ah-shared"
import { addYearAndMonthToContestName, findDocUrl, findTags, getAnyDateUTCTimestamp, trimContestName } from "../util.js"
import { MdContest, MdStatus, isActive } from "./types.js"
import { scrape } from "../web-load/playwright-loader.js"
import anyDate from "any-date-parser"

export const parseContest = async (
  contest: MdContest
): Promise<ContestWithModules> => {
  let md = await downloadContestAsMd(contest)
  return parseMd(contest, md)
}

let downloadContestAsMd = async (contest: MdContest): Promise<string> => {
  let url = `https://immunefi.com/bounty/${contest.id}`
  let md = (await scrape(url, [])).content
  if (md.match(/\n#\s/)) md = md.split(/\n#\s/)[1]

  return md
}

export const parseMd = (
  mdContest: MdContest,
  md: string
): ContestWithModules => {
  let lines = md.split("\n")

  let { start_date, end_date } = getStartEndDate(lines)

  let active = isActive(mdContest.status) ? 1 : 0
  let modules = findModules(mdContest.name, lines, active)
  
  let contest: ContestWithModules = {
    pk: trimContestName(mdContest.name, start_date),
    readme: `# ${lines.join("\n")}`,
    start_date: start_date,
    end_date: end_date,
    platform: "immunefi",
    sk: "0",
    url: `https://immunefi.com/bounty/${mdContest.id}`,
    active: active,
    status: mdStatusToStatus(mdContest.status),
    modules: modules,
    doc_urls: findDocUrls(lines),
    prize: mdContest.prize,
    tags: findTags(lines),
  }

  return contest
}

let mdStatusToStatus = (status: MdStatus): Status => {
  if (status === "live") return "active"
  if (status === "starting in") return "created"
  if (status === "finished") return "finished"
  throw new Error(`Unknown status: ${status}`)
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
function getStartEndDate(lines: string[]): { start_date: any; end_date: any } {
  let startPrefix = ["Started", "Starts"]
  let endPrefix = "Ends"

  let startLine = lines.findIndex((it) =>
    startPrefix.some((prefix) => it.startsWith(prefix))
  )
  let startDateLine = lines[startLine + 2]

  let endLine = lines.findIndex((it) => it.startsWith(endPrefix))
  let endDateLine = lines[endLine + 2]

  let start_date = getAnyDateUTCTimestamp(anyDate.attempt(startDateLine))
  let end_date = getAnyDateUTCTimestamp(anyDate.attempt(endDateLine))

  return { start_date, end_date }
}
