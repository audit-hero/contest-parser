import { NodeHtmlMarkdown } from "node-html-markdown"
import { getAnyDateUTCTimestamp, truncateLongContestName } from "../util.js"
import anyDate from "any-date-parser"
import { MdContest, MdStatus, statuses } from "./types.js"
import { parseMd } from "./parseContests.js"

export const getActiveCantinaContests = async (): Promise<MdContest[]> => {
  return getActiveContests()
}

export const getAllContests = async (): Promise<MdContest[]> => {
  let md = await getHtmlAsMd()
  return parseMd(md)
}

export const getActiveContests = async () => {
  let allContests = await getAllContests()

  let epochSeconds = Math.floor(Date.now() / 1000)

  return allContests.filter((it) => {
    return it.start_date <= epochSeconds && it.end_date >= epochSeconds
  })
}

const getHtmlAsMd = async () => {
  let contests: string = await fetch("https://cantina.xyz/competitions")
    .then((it) => {
      return it.text()
    })
    .catch((e) => {
      console.log(`error ${e}`)
      throw Error("can't fetch cantina contests")
    })

  let parsed = NodeHtmlMarkdown.translate(contests)
  return parsed
}
