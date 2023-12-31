import { Contest } from "ah-shared"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { getAnyDateTimestamp, truncateLongContestName } from "../util.js"
import anyDate from "any-date-parser"

export const getActiveCantinaContests = async (): Promise<MdContest[]> => {
  let md = await getHtmlAsMd()
  return getActiveContests(md)
}

export type MdContest = {
  name: string
  id: string
  start_date: number
  end_date: number
  prize: string
}

export const getActiveContests = (md: string): MdContest[] => {
  let lines = md.split("\n")

  let results = [] as MdContest[]

  let name: string = ""
  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i]

    if (line.startsWith("# ")) {
      name = truncateLongContestName(
        line.replace("# ", "").toLowerCase().replace(/ /g, "-")
      )
    }

    if (name !== "" && line.startsWith("[View competition](")) {
      let id = line
        .replace("[View competition](/competitions/", "")
        .replace(")", "")
      let dateLine = lines[i - 2]
      let { start_date, end_date } = getStartEndDate(dateLine)
      let prize = lines[i - 4]

      results.push({ name, id, start_date, end_date, prize })

      name = ""
    }
  }

  return results
}

const getStartEndDate = (
  dateLine: string
): {
  start_date: number
  end_date: number
} => {
  let start_date = getAnyDateTimestamp(
    anyDate.attempt(dateLine.split(" - ")[0])
  )
  let end_date = getAnyDateTimestamp(anyDate.attempt(dateLine.split(" - ")[1]))

  return { start_date, end_date }
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
