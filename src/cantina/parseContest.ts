import { ContestModule, ContestWithModules } from "ah-shared"
import { NodeHtmlMarkdown } from "node-html-markdown"
import {
  findDocUrl,
  findTags,
} from "../util.js"
import { MdContest } from "./getActive.js"

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
  // remove header links
  let lines = md.split("\n# ").slice(1).join("").split("\n")
  if (lines[lines.length - 5].startsWith("You need to be logged in"))
    lines = lines.slice(0, -5)

  let contest: ContestWithModules = {
    pk: mdContest.name,
    readme: `# ${lines.join("\n")}`,
    start_date: mdContest.start_date,
    end_date: mdContest.end_date,
    platform: "cantina",
    sk: "0",
    url: `https://cantina.xyz/competitions/${mdContest.id}`,
    active: 1,
    status: "active",
    modules: findModules(mdContest.name, lines),
    doc_urls: findDocUrls(lines),
    prize: mdContest.prize,
    tags: findTags(lines),
  }

  return contest
}

const findModules = (contest: string, lines: string[]): ContestModule[] => {
  let modulesStart =
    lines.findIndex(
      (it) => it.includes("# ") && it.toLowerCase().includes("scope")
    ) + 1

  let modulesEnd = lines.findIndex((it) => {
    return (
      (it.includes("# ") && it.toLowerCase().includes("out of scope")) ||
      (it.includes("# ") && it.toLowerCase().includes("Summary"))
    )
  })
  if (modulesEnd === -1) modulesEnd = lines.length
  if (modulesStart === -1) return []

  let currentRepo = ""
  let modules = [] as ContestModule[]
  for (let i = modulesStart; i < modulesEnd; ++i) {
    let line = lines[i]
    if (
      line.includes("github.com") ||
      line.includes("raw.githubusercontent.com")
    )
      currentRepo = line.split("](").pop()!.slice(0, -1)
    if (currentRepo !== "" && line.includes(".sol") && line.includes("|")) {
      let path = line.split("|")[1].trim()

      let module: ContestModule = {
        name: path.split("/").pop()!,
        contest: contest,
        active: 1,
        path,
        url: `${currentRepo}/${path}`,
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
