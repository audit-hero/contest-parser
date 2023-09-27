import Logger from "js-logger"

let ignoreLinkWords = [
  "report",
  "twitter",
  "discord"
] as string[]

let docHeadings = [
  "about", "overview"
]

export const getMdHeading = (line: string, headings: string[]) => {
  let pattern = /^(#{1,6})\s+(.+)$/g
  let match = pattern.exec(line)

  if (match?.length ?? 0 > 0) {
    let newHeading = match![0]
    let headingLevel = newHeading.match(/#/g)!.length
    let existingHeading = headings.findIndex(it => it.match(/#/g)!.length === headingLevel)
    if (existingHeading > -1) {
      // replace the heading and all of headings below it
      headings.splice(existingHeading)
      headings.push(newHeading)
    }
    else headings.push(newHeading)

    return newHeading
  }
}

export const findDocUrl = (line: string, headings: string[]) => {
  if (!docHeadings.some(docHeadings =>
    headings.some(heading => heading.toLowerCase().includes(docHeadings)))
  ) return []

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

export let workingDir = () => {
  let workingDir = `/${import.meta.url.split('/').slice(3, -2).join('/')}`
  return workingDir
}