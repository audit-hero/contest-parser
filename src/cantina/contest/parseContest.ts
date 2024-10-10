import { ContestModule, ContestWithModules, Status } from "ah-shared"
import { findDocUrl, findTags, trimContestName } from "../../util.js"
import { CantinaContest, CantinaStatus } from "../types.js"
import { loadNextProps } from "../../web-load/load-next-props.js"

export const parseContest = async (contest: CantinaContest): Promise<ContestWithModules> => {
  let md = await downloadContestAsMd(contest)
  return parseMd(contest, md)
}

let downloadContestAsMd = async (contest: CantinaContest): Promise<string> => {
  let props = await loadNextProps(`https://cantina.xyz/competitions/${contest.id}`)
  return props.competition.instructions
}

export const parseMd = (contest: CantinaContest, md: string): ContestWithModules => {
  let name = contest.name
  let lines = md.split("\n")

  let startDate = new Date(contest.timeframe.start).getTime() / 1000
  let active = contest.status === "live" ? 1 : 0
  let modules = findModules(name, lines, startDate, active)

  let result: ContestWithModules = {
    pk: trimContestName(name, startDate),
    readme: trimPageToMd(lines.join("\n"), contest),
    start_date: startDate,
    end_date: new Date(contest.timeframe.end).getTime() / 1000,
    platform: "cantina",
    sk: "0",
    url: `https://cantina.xyz/competitions/${contest.id}`,
    active: active,
    status: mdStatusToStatus(contest.status),
    modules: modules,
    doc_urls: findDocUrls(lines),
    prize: `${contest.totalRewardPot} ${contest.currencyCode}`,
    tags: findTags(lines),
    repo_urls: [contest.gitRepoUrl],
  }

  return result
}

let trimPageToMd = (page: string, contest: CantinaContest) => {
  let start = contest.name
  let end = "You need to be logged in as a researcher in order to join."

  let split = page.split("\n")
  let startIndex = split.findIndex((it) => it.includes(start))
  let endIndex = split.findIndex((it) => it.includes(end))
  return split.slice(startIndex, endIndex).join("\n")
}

let mdStatusToStatus = (status: CantinaStatus): Status => {
  if (status === "live") return "active"
  if (status === "upcoming") return "created"
  if (status === "judging") return "judging"
  if (status === "escalations") return "judging"
  if (status === "ended" || status === "completed") return "finished"

  throw new Error(`Unknown status: ${status}`)
}

let getModulesStartIndex = (lines: string[]) => {
  let modulesStart = lines.findIndex(
    (it) =>
      it.includes("# ") &&
      it.toLowerCase().includes("scope") &&
      !it.toLowerCase().includes("out of scope"),
  )

  if (modulesStart === -1) {
    modulesStart = lines.findIndex(
      (it) => it.includes("# ") && it.toLowerCase().includes(" contracts"),
    )
  }

  let hashCount = modulesStart === -1 ? 0 : lines[modulesStart].match(/^#+/)?.[0].length ?? 0
  return {
    modulesStart,
    hashCount,
  }
}

const findModules = (
  contest: string,
  lines: string[],
  startDate: number,
  active: number,
): ContestModule[] => {
  let { modulesStart, hashCount } = getModulesStartIndex(lines)

  let modulesEnd = lines.findIndex((it, index) => {
    return it.match(/#{1,6}.*(out of scope)/i) || it.match(/#{1,3} summary/i)
  })
  if (modulesEnd === -1) modulesEnd = lines.length
  if (modulesStart === -1) return []
  modulesStart += 1

  let currentRepo = "no-repo"
  let modules = [] as ContestModule[]
  for (let i = modulesStart; i < modulesEnd; ++i) {
    let line = lines[i]
    if (line.includes("github.com") || line.includes("raw.githubusercontent.com")) {
      currentRepo = line.split("](").pop()!.trim().slice(0, -1).replace("/commit/", "/tree/")
    }

    // doesn't have an extension
    if (!line.includes("|") || !line.match(/\.[0-9a-z]+/i)) continue

    let path = line.split("|")[1].trim().replace("./", "").replace("\\_", "_")

    let module: ContestModule = {
      name: path.split("/").pop()!,
      contest: trimContestName(contest, startDate),
      active: active,
      path,
      url: `${currentRepo}/${path}`,
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
