import { Logger } from "jst-logger"

export let moduleExtensions = [".sol", ".go", ".rs", "cairo"]

let ignoreLinkWords = [
  "report",
  "twitter",
  "discord",
  "security-review",
] as string[]

export let docHeadings = [
  "about",
  "overview",
  "resources",
  "q&a",
  "additional context",
  "links",
]

export let ignoredScopeFiles = [
  "test",
  "mock",
  "script",
  ".s.sol",
  ".t.sol",
  "forge-std",
  "hardhat",
]

export const getContestStatus = (dates: {
  startDate: number
  endDate: number
}): Status => {
  let now = Date.now() / 1000
  if (now < dates.startDate) return "created"
  else if (now > dates.endDate) return "finished"
  else return "active"
}

export let addYearAndMonthToContestName = (name: string, startDate: number) => {
  if (name.match(/^\d{4}-\d{2}-/)) return name
  let startYear = new Date(startDate * 1000).getFullYear()
  let startMonth = new Date(startDate * 1000).getMonth() + 1
  return `${startYear}-${startMonth.toString().padStart(2, "0")}-${name}`
}

export let trimContestName = (contestName: string) => {
  return contestName
    .replace(/[^a-zA-Z0-9-]/g, "") // replace all non-alphanumeric characters with ""
    .replace(/-{2,4}/g, "-") // replace all multiple dashes with single dash
}

export const getMdHeading = (line: string, headings: string[]) => {
  let pattern = /^(#{1,6})\s+(.+)$/g
  let match = pattern.exec(line)

  if (match?.length ?? 0 > 0) {
    let newHeading = match![0]
    let headingLevel = newHeading.match(/#/g)!.length
    let existingHeading = headings.findIndex(
      (it) => it.match(/#/g)!.length === headingLevel
    )
    if (existingHeading > -1) {
      // replace the heading and all of headings below it
      headings.splice(existingHeading)
      headings.push(newHeading)
    } else headings.push(newHeading)

    return newHeading
  }
}

export const findDocUrl = (line: string, headings: string[]) => {
  if (
    !docHeadings.some((docHeadings) =>
      headings.some((heading) => heading.toLowerCase().includes(docHeadings))
    )
  )
    return []

  const pattern = /\bhttps?:\/\/\S+\b/g

  let urls = line.match(pattern)
  let docs = [] as string[]

  if (urls?.length ?? 0 > 0) {
    for (let i = 0; i < urls!.length; ++i) {
      let url = urls![i]
      if (ignoreLinkWords.some((it) => url.toLowerCase().includes(it))) continue
      docs.push(url)
    }
  }

  return docs
}

export const findTags = (lines: string[]) => {
  let tags = [] as Tag[]
  for (let line of lines) {
    // find tags
    ALL_TAGS.forEach((tag, index) => {
      if (index > 0) {
        if (line.toLowerCase().includes(tag)) {
          tags.push(tag as Tag)
        }
      }
    })
  }

  return tags.filter((it, index) => tags.indexOf(it) === index)
}

export const getAllRepos = async (org: string): Promise<Repo[]> => {
  var reposLength = 100
  var reposBuilder: any[] = []
  var page = 1
  while (reposLength == 100) {
    let repos = await fetch(
      `https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`,
      githubParams
    )
      .then(async (it) => {
        let text = await it.text()
        return JSON.parse(text) as Repo[]
      })
      .catch((e) => {
        Logger.error(`get repos error: ${e}`)
        throw e
      })

    reposBuilder = reposBuilder.concat(repos)

    reposLength = repos.length
    page++
  }

  return reposBuilder
}

const getPushTimestamp = (timestamp: string) =>
  Math.floor(new Date(timestamp).getTime() / 1000)

export const getRepoNameFromUrl = (url: string) => {
  let split = url.split("/")
  if (split[split.length - 1] === "") split.pop()
  return split[split.length - 1]
}

import { githubParams } from "./config.js"
import { Tag, ALL_TAGS, Status } from "ah-shared"
import { Repo } from "ah-shared"

export let workingDir = () => {
  let workingDir = `/${import.meta.url.split("/").slice(3, -2).join("/")}`
  return workingDir
}

export const logTrace = (msg: () => string) => {
  Logger.trace(msg())
}

export let truncateLongContestName = (name: string) => {
  // cohere table starts with `ah-00000000-3a7b-` 17 characters.
  // max length is 64, so 47 characters left

  let maxLength = 47
  let trimmedSlug = name

  if (trimmedSlug.length > maxLength) {
    trimmedSlug = name.slice(0, maxLength)
    for (let i = 1; i < 10; i++) {
      if (name[maxLength - 1 - i] == "-") {
        trimmedSlug = name.slice(0, maxLength - 1 - i)
        break
      }
    }
  }

  return trimmedSlug
}

export const getAnyDateUTCTimestamp = (anyDate: any) => {
  // August 21, 2023
  if (anyDate.year === undefined) anyDate.year = new Date().getFullYear()

  if (anyDate.month === undefined || anyDate.day === undefined)
    throw new Error("invalid anydate")

  var someDate = Date.UTC(
    anyDate.year,
    anyDate.month - 1,
    anyDate.day,
    anyDate.hour ?? 0,
    anyDate.minute ?? 0,
    anyDate.second ?? 0
  )

  return someDate / 1000
}
