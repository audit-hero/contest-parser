import { ContestModule, ContestWithModules, Status } from "ah-shared"
import { NodeHtmlMarkdown } from "node-html-markdown"
import {
  findDocUrl,
  findTags,
  getReadmeFromGithub,
  githubUrlToRawUrl,
  trimContestName,
} from "../util.js"
import { parseTreeModulesV2 } from "../parse-modules.js"
import { HawksApiContest } from "./getActive-api.js"

export const parseContest = async (contest: HawksApiContest): Promise<ContestWithModules> => {
  let [md, readme] = await downloadContestAsMd(contest)
  return parseMd(contest, md, readme)
}

let downloadContestAsMd = async (
  contest: HawksApiContest,
): Promise<[string, string | undefined]> => {
  let url = `https://www.codehawks.com/contests/${contest.id}`
  let [html, readme] = await Promise.all([fetch(url).then((it) => it.text()), getReadme(contest)])
  let md = NodeHtmlMarkdown.translate(html)
  return [md, readme]
}

let getReadme = async (contest: HawksApiContest): Promise<string | undefined> => {
  let user = contest.githubUrl.split("/")[3]
  let repo = contest.githubUrl.split("/")[4]
  if (!repo || !user) return undefined

  let readme = await getReadmeFromGithub(user, repo)

  return readme?.readme
}

export const parseMd = (
  apiContest: HawksApiContest,
  md: string,
  readme: string | undefined,
): ContestWithModules => {
  // remove header links
  let lines = md.split("MENU")
  if (lines.length === 1) lines = lines[0].split("\n")
  else lines = lines[1].split("\n")

  let { start_date, end_date } = getStartEndDate(apiContest)
  let active = end_date > Math.floor(Date.now() / 1000) ? 1 : 0
  let pk = trimContestName(apiContest.urlSlug, start_date)

  let modules = [] as ContestModule[]
  if (readme) modules = findModules(apiContest, pk, readme.split("\n"), active)

  if (start_date) apiContest = updateContestNameDate(apiContest, start_date)

  let contest: ContestWithModules = {
    pk,
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

let getModulesStartEndIndex = (lines: string[]) => {
  let scopeParagraphIdx = getModulesStartIndex(lines)

  let lineWithSourceFiles = lines
    .slice(scopeParagraphIdx)
    .findIndex((it) => it.match(/.*\.(sol|go|rs|cairo)/))

  let codeBlockStart = -1
  for (let i = scopeParagraphIdx + lineWithSourceFiles; i > scopeParagraphIdx; --i) {
    if (lines[i].includes("```")) {
      codeBlockStart = i
      break
    }
  }

  if (codeBlockStart === -1) return { start: -1, end: -1 }

  let end =
    lines.slice(codeBlockStart).findIndex((it, index) => {
      return (
        (it.match(/^#{1,3} /) && it.toLowerCase().includes("out of scope")) ||
        (it.match(/^#{1,3} /) && it.toLowerCase().includes("summary")) ||
        it.match(/^#{1,4} /)
      )
    }) + codeBlockStart

  if (end === -1) end = lines.length
  if (scopeParagraphIdx === -1) return { start: -1, end: -1 }
  scopeParagraphIdx += 1

  return { scopeParagraphIdx, codeBlockStart, end }
}

let getModulesStartIndex = (lines: string[]) => {
  let start = lines.findIndex(
    (it) =>
      it.match(/^#{1,3} /) &&
      it.toLowerCase().includes("scope") &&
      !it.toLowerCase().includes("out of scope"),
  )

  if (start === -1) {
    start = lines.findIndex((it) => it.match(/^#{1,3} /) && it.toLowerCase().includes(" contracts"))
  }

  return start
}

const findModules = (
  contest: HawksApiContest,
  pk: string,
  lines: string[],
  active: number,
): ContestModule[] => {
  let { scopeParagraphIdx, codeBlockStart, end } = getModulesStartEndIndex(lines)
  if (scopeParagraphIdx === -1 || end === -1 || codeBlockStart === -1) return []

  let modules = [] as ContestModule[]

  let repos =
    lines
      .slice(scopeParagraphIdx, end)
      .join("\n")
      .match(/https:\/\/github.com\/[^/]+\/[^/>]+/m)
      ?.map((it) => {
        if (it.includes("tree")) return it
        return it + "/tree/main"
      }) ?? []

  if (repos.length === 0) {
    if (contest.githubUrl) repos.push(contest.githubUrl + "/tree/main")
    else addMainRepo(lines, repos)
  }

  let scope = lines.slice(codeBlockStart, end).join("\n")
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
        contest: pk,
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
