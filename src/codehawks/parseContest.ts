import { ContestModule, ContestWithModules, Status } from "ah-shared"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { findDocUrl, findTags, trimContestName } from "../util.js"
import { parseTreeModulesV2 } from "../parse-modules.js"
import { HawksApiContest } from "./getActive-api.js"

export const parseContest = async (contest: HawksApiContest): Promise<ContestWithModules> => {
  let md = await downloadContestAsMd(contest)
  return parseMd(contest, md)
}

let downloadContestAsMd = async (contest: HawksApiContest): Promise<string> => {
  let url = `https://www.codehawks.com/contests/${contest.id}`
  let html = await fetch(url).then((it) => it.text())
  let md = NodeHtmlMarkdown.translate(html)
  return md
}

export const parseMd = (apiContest: HawksApiContest, md: string): ContestWithModules => {
  // remove header links
  let lines = md.split("MENU")
  if (lines.length === 1) lines = lines[0].split("\n")
  else lines = lines[1].split("\n")

  let { start_date, end_date } = getStartEndDate(apiContest)
  let active = end_date > Math.floor(Date.now() / 1000) ? 1 : 0

  let modules = findModules(apiContest.name, lines, active)

  if (start_date) apiContest = updateContestNameDate(apiContest, start_date)

  let contest: ContestWithModules = {
    pk: trimContestName(apiContest.urlSlug, start_date),
    readme: `# ${lines.join("\n")}`,
    start_date,
    end_date,
    platform: "codehawks",
    sk: "0",
    url: `https://www.codehawks.com/contests/${apiContest.id}`,
    active: active,
    status: mdStatusToStatus(apiContest),
    modules: modules,
    doc_urls: findDocUrls(lines),
    prize: `${apiContest.rewardHighMedium} ${apiContest.currency}`,
    tags: findTags(lines),
  }

  return contest
}

let updateContestNameDate = (contest: HawksApiContest, start_date: number) => {
  let startYear = new Date(start_date * 1000).getFullYear()
  let startMonth = new Date(start_date * 1000).getMonth() + 1

  contest.name = `${startYear}-${startMonth.toString().padStart(2, "0")}-${contest.name
    .split("-")
    .slice(2)
    .join("-")}`

  return contest
}

let mdStatusToStatus = (contest: HawksApiContest): Status => {
  if (new Date(contest.endDate).getTime() / 1000 < Math.floor(Date.now() / 1000)) {
    return "finished"
  }

  if (new Date(contest.startDate).getTime() / 1000 < Math.floor(Date.now() / 1000)) {
    return "active"
  }

  return "created"
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

  return modulesStart
}

const findModules = (contest: string, lines: string[], active: number): ContestModule[] => {
  let modulesStart = getModulesStartIndex(lines)

  let noTreeAfterThisLine = (lines: string[], index: number) => {
    for (let i = index; i < lines.length; ++i) {
      if (lines[i].includes("```tree")) return false
    }
    return true
  }

  let modulesEnd = lines.findIndex((it, index) => {
    return (
      index > modulesStart &&
      ((it.includes("# ") && it.toLowerCase().includes("out of scope")) ||
        (it.includes("# ") && it.toLowerCase().includes("summary")) ||
        it.match(/^#{1,4} /)) &&
      noTreeAfterThisLine(lines, index)
    )
  })

  if (modulesEnd === -1) modulesEnd = lines.length
  if (modulesStart === -1) return []
  modulesStart += 1

  let modules = [] as ContestModule[]

  let scope = lines.slice(modulesStart, modulesEnd).join("\n")
  let repos = (scope.match(/https:\/\/github.com\/[^/]+\/[^/>]+/g) ?? []).map((it) => {
    if (it.includes("tree")) return it
    return it + "/tree/main"
  })

  if (repos.length === 0) {
    addMainRepo(lines, repos)
  }

  const regex = /```[\s\S]*?```/g
  const blocks = scope.match(regex)
  let blockModules = blocks?.map((block) => parseTreeModulesV2(block.split("\n"))) ?? []

  if (repos.length < blockModules.length) {
    // fill repos until moduleStrings.length
    let reposLength = repos.length
    let diff = blockModules.length - reposLength
    for (let i = 0; i < diff; ++i) {
      repos.push(repos[reposLength - 1])
    }
  }

  for (let i = 0; i < blockModules.length; ++i) {
    let moduleStrings = blockModules[i]
    let repo = repos[i]

    for (let path of moduleStrings) {
      let module: ContestModule = {
        name: path.split("/").pop()!,
        contest,
        active,
        path,
        url: `${repo}/${path}`,
      }

      modules.push(module)
    }
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

let getStartEndDate = (contest: HawksApiContest) => {
  return {
    start_date: new Date(contest.startDate).getTime() / 1000,
    end_date: new Date(contest.endDate).getTime() / 1000,
  }
}

function addMainRepo(lines: string[], repos: string[]) {
  let mainRepo = ""
  for (let line of lines) {
    let repo = line.match(/https:\/\/github.com\/[^/]+\/[^/>\)]+/g)
    if (repo) {
      mainRepo = repo[0]
      break
    }
  }
  if (mainRepo) {
    if (!mainRepo.includes("tree")) mainRepo += "/tree/main"
    repos.push(mainRepo)
  }
}
