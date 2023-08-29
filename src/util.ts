import Logger from "js-logger"

let ignoreLinkWords = [
  "report"
] as string[]

let searchDocsInHeadings = [
  "about", "overview"
]

export const getMdHeading = (line: string) => {
  let pattern = /^(#{1,6})\s+(.+)$/g
  let match = pattern.exec(line)
  if (match?.length ?? 0 > 0) {
    return match![0]
  }
}

export const findDocUrl = (line: string, readmeHeading: string) => {
  if (!searchDocsInHeadings.some(it => readmeHeading.toLowerCase().includes(it))) return []

  const pattern = /\bhttps?:\/\/\S+\b/g

  let urls = line.match(pattern)
  let docs = [] as string[]

  if (urls?.length ?? 0 > 0) {
    for (let i = 0; i < urls!.length; ++i) {
      let url = urls![i]
      if (ignoreLinkWords.some(it => url.toLowerCase().includes(it))) continue
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
    let repos = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`, githubParams)
      .then(async it => (JSON.parse(await it.text()) as Repo[])
      ).catch(e => {
        Logger.error(`get repos error: ${e}`)
        throw e
      })

    reposBuilder = reposBuilder.concat(repos)

    reposLength = repos.length
    page++
  }

  return reposBuilder
}

const getPushTimestamp = (timestamp: string) => Math.floor(new Date(timestamp).getTime() / 1000)

export const getRepoNameFromUrl = (url: string) => {
  let split = url.split("/")
  if (split[split.length - 1] === "") split.pop()
  return split[split.length - 1]
}

import { githubParams } from "./config.js"
import { Tag, ALL_TAGS } from "ah-shared"
import { Repo } from "ah-shared"

export let workingDir = async () => {
  let path = await import("path");
  let { fileURLToPath } = await import("url");

  const __filename = fileURLToPath(import.meta.url ?? "");
  const __dirname = path.dirname(__filename);

  return path.join(__dirname, "..")
}