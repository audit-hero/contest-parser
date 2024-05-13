import { ContestModule, ContestWithModules, Status } from "ah-shared"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { findDocUrl, findTags, trimContestName } from "../util.js"
import { MdContest, MdStatus } from "./types.js"

export const parseContest = async (
  contest: MdContest
): Promise<ContestWithModules> => {
  let md = await downloadContestAsMd(contest)
  return parseMd(contest, md)
}

let downloadContestAsMd = async (contest: MdContest): Promise<string> => {
  let url = `https://cantina.xyz/competitions/${contest.id}`
  let html = await fetch(url).then((it) => it.text())
  let md = NodeHtmlMarkdown.translate(html)
  return md
}

export const parseMd = (
  mdContest: MdContest,
  md: string
): ContestWithModules => {
  let name = getName(md.split("\n")) ?? mdContest.name

  // remove header links
  let lines = md.split("\n# ").slice(1).join("").split("\n")
  if (lines.length === 1)
    lines = md.split("\n## ").slice(1).join("").split("\n")
  if (lines[lines.length - 5].startsWith("You need to be logged in"))
    lines = lines.slice(0, -5)


  let active = mdContest.end_date > Math.floor(Date.now() / 1000) ? 1 : 0
  let modules = findModules(name, lines, active)

  let contest: ContestWithModules = {
    pk: trimContestName(name, mdContest.start_date),
    readme: `# ${lines.join("\n")}`,
    start_date: mdContest.start_date,
    end_date: mdContest.end_date,
    platform: "cantina",
    sk: "0",
    url: `https://cantina.xyz/competitions/${mdContest.id}`,
    active: active,
    status: mdStatusToStatus(mdContest.status),
    modules: modules,
    doc_urls: findDocUrls(lines),
    prize: mdContest.prize,
    tags: findTags(lines),
  }

  return contest
}

let getName = (lines: string[]) => {
  let name = lines.find((it) => it.match(/^#{1,3} /))?.replace(/^#{1,3} /, "")
  return name
}

let mdStatusToStatus = (status: MdStatus): Status => {
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

  let modulesEnd = lines.findIndex((it) => {
    return (
      (it.includes("# ") && it.toLowerCase().includes("out of scope")) ||
      (it.includes("# ") && it.toLowerCase().includes("summary"))
    )
  })
  if (modulesEnd === -1) modulesEnd = lines.length
  if (modulesStart === -1) return []
  modulesStart += 1

  let currentRepo = "no-repo"
  let modules = [] as ContestModule[]
  for (let i = modulesStart; i < modulesEnd; ++i) {
    let line = lines[i]
    if (
      line.includes("github.com") ||
      line.includes("raw.githubusercontent.com")
    ) {
      currentRepo = line
        .split("](")
        .pop()!
        .slice(0, -1)
        .replace("/commit/", "/tree/")
    }

    // doesn't have an extension
    if (!line.includes("|") || !line.match(/\.[0-9a-z]+/i)) continue

    let path = line.split("|")[1].trim().replace("./", "").replace("\\_", "_")

    let module: ContestModule = {
      name: path.split("/").pop()!,
      contest: contest,
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
