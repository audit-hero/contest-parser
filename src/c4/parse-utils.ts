import { ContestModule } from "ah-shared"
import { C4Contest } from "../types.js"
import { getMdHeading, findDocUrl } from "../util.js"
import Logger from "js-logger"
import { string } from "fp-ts"
import parseUrl from "parse-url"

export const getHmAwards = (contest: C4Contest, lines: string[]): string => {
  if (contest.hm_award_pool) return contest.hm_award_pool.toString()
  let hmAwards = contest.amount

  let until = lines.length * 0.3
  if (until < 10) until = lines.length
  // modules
  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i]

    let trimmed = line.replace(/\\|\//g, "").toLowerCase()

    if (
      (trimmed.includes("hm") ||
        (trimmed.includes("high") && trimmed.includes("medium"))) &&
      line.includes(":")
    ) {
      let awards = line.split(":")[1].trim()
      // check if award includes a number(with commas)
      let match = awards.match(/(\d{1,3},)*\d{1,3}/)
      if (match) {
        hmAwards = match[0].replace(/,/g, "")
        break
      }
    }
  }

  return hmAwards
}

const notInScopeHeadingLine = (line: string) => {
  let lowerCaseLine = line.toLowerCase()
  return (
    lowerCaseLine.includes("not in scope") ||
    lowerCaseLine.includes("out of scope")
  )
}

const inScopeHeadingLine = (line: string) => {
  let lowerCaseLine = line.toLowerCase()
  return (
    lowerCaseLine.includes("scope") && !notInScopeHeadingLine(lowerCaseLine)
  )
}

export const findModules = (
  repo: string,
  lines: string[],
  moduleFindWay: number
): {
  modules: ContestModule[]
  docUrls: string[]
} => {
  let inScopeHeading = false
  let docUrls = [] as string[]
  let modules = [] as ContestModule[]
  let referenceLinks = getLinkReferences(lines)
  let headings = [] as string[]

  // modules
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    getMdHeading(line, headings)

    let newDocs = findDocUrl(line, headings)
    if (newDocs.length > 0) docUrls = docUrls.concat(newDocs)

    if (!inScopeHeading) {
      if (inScopeHeadingLine(line)) {
        inScopeHeading = true
      }
      continue
    }

    if (notInScopeHeadingLine(line)) {
      inScopeHeading = false
    }

    if (inScopeHeading) {
      if (moduleFindWay == 0) {
        // latest one
        let module = findModuleFromTable(line, repo, referenceLinks)
        if (module) modules.push(module)
      } else {
        let module = findModuleSloc(line, repo)
        if (module) modules.push(module)
      }
    }
  }

  // try other standard
  if (modules.length == 0 && moduleFindWay < 1) {
    moduleFindWay++
    findModules(repo, lines, moduleFindWay++)
  }

  docUrls = docUrls.filter((it, index) => docUrls.indexOf(it) === index)
  docUrls = docUrls.filter((it) => !modules.find((module) => module.url == it))

  return {
    modules: modules,
    docUrls: docUrls,
  }
}

const findModuleFromTable = (
  line: string,
  repo: string,
  referenceLinks: ReferenceLink[]
) => {
  let module: ContestModule | undefined = undefined
  try {
    // any file with an extension
    let isAFile = line.includes("|") && line.match(/\.[a-z0-9]+/g)

    if (isAFile) {
      let lineSplit: string[] = line.split("|").map((it) => it.trim())
      if (lineSplit.length < 2) return undefined

      let url = "",
        path = ""
      for (let i = 0; i < lineSplit.length; ++i) {
        let pathAndUrl = lineSplit[i]

        let bySplit = getModulePathAndUrlBySplit(pathAndUrl)
        if (bySplit) {
          url = bySplit.url
          path = bySplit.path
          break
        } else {
          let referenceLink = matchReferenceLink(pathAndUrl, referenceLinks)
          if (referenceLink) {
            url = referenceLink
            path = pathAndUrl
            break
          }
        }
      }

      path = path.replaceAll("`", "")

      let name = path.split("/").pop()!!

      let loc = 0

      for (let i = 0; i < lineSplit.length; ++i) {
        let possibleLoc = parseInt(lineSplit[i])
        if (possibleLoc) {
          loc = possibleLoc
          break
        }
      }

      if (!isValidUrl(url)) {
        Logger.warn(`invalid url ${url}`)
        url = ""
      }

      module = {
        name: name,
        path: path,
        url: url,
        loc: loc,
        contest: repo,
        active: 1,
      }
    }
  } catch (e) {
    console.log(`failed to parse line ${line}`)
  }

  return module
}

const isValidUrl = (url: string) => {
  try {
    parseUrl(url)
  } catch (e) {
    return false
  }
  return true
}

type ReferenceLink = {
  name: string
  url: string
}

const getLinkReferences = (content: string[]) => {
  // find [`LSP0ERC725AccountCore.sol`]: https://githu...tCore.sol
  // style links
  let regex = /^\[(.*)\]:\s*(.*)/g
  let matches = content.reduce((acc, it) => {
    let match = it.match(regex)
    if (match) acc.push(match)
    return acc
  }, [] as RegExpMatchArray[])

  let links = []
  for (const matchArr of matches) {
    let match = matchArr[0]
    let split = match.split("]:")
    links.push({
      name: split[0].replace("[", "").trim(),
      url: split[1].trim(),
    })
  }

  return links
}

const matchReferenceLink = (line: string, links: ReferenceLink[]) => {
  let regex = /\[(.*)\]/g
  let match = line.match(regex)
  if (match) {
    let name = match[0].replace("[", "").replace("]", "")
    let link = links.find((it) => it.name === name)
    if (link) return link.url
  }
}

export const getTimestamp = (date: string) => {
  var someDate = new Date(date)
  return Math.floor(someDate.getTime() / 1000)
}

export let truncateLongNames = (contests: C4Contest[]) => {
  // cohere table starts with `ah-00000000-3a7b-` 17 characters.
  // max length is 64, so 47 characters left

  let maxLength = 47

  for (let contest of contests) {
    let trimmedSlug = contest.slug

    if (trimmedSlug.length > maxLength) {
      trimmedSlug = contest.slug.slice(0, maxLength)
      for (let i = 1; i < 10; i++) {
        if (contest.slug[maxLength - 1 - i] == "-") {
          trimmedSlug = contest.slug.slice(0, maxLength - 1 - i)
          break
        }
      }
    }

    contest.trimmedSlug = trimmedSlug
  }
}

const getModulePathAndUrlBySplit = (
  pathAndUrl: string
):
  | {
      path: string
      url: string
    }
  | undefined => {
  try {
    let path, url
    let pathAndUrlSplit = pathAndUrl.split("](")
    path = pathAndUrlSplit[0].split("[")[1].replaceAll("`", "")
    url = pathAndUrlSplit[1].split(")")[0].replaceAll("`", "")

    if (url.endsWith("/")) url = url.substring(0, url.length - 1)
    if (url.endsWith(".sol") && !path.endsWith(".sol")) path += ".sol"

    return { path, url }
  } catch (e) {
    return undefined
  }
}

const findModuleSloc = (line: string, repo: string) => {
  let module: ContestModule | undefined = undefined
  try {
    // let inculdesContracts = it.includes("contracts/")
    // let includesSrc = it.includes("src/")
    let lowerCaseLine = line.toLowerCase()
    let includesSloc = line.includes(".sol") && lowerCaseLine.includes("loc")

    if (includesSloc) {
      let lineSplit: string[] = line.split(".sol").map((it) => it.trim())
      let name = lineSplit[0] + ".sol"
      let loc = parseInt(lineSplit[1].match(/\d+/)![0])

      module = {
        name: name!!,
        path: name,
        url: "",
        loc: loc,
        contest: repo,
        active: 1,
      }
    }
  } catch (e) {
    console.log(`failed to parse line ${line}`)
  }

  return module
}
