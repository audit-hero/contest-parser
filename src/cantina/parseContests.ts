import { getAnyDateUTCTimestamp, truncateLongContestName } from "../util.js"

import { MdContest, MdStatus, statuses } from "./types.js"
import { sentryError } from "ah-shared"

export const parseMd = (md: string): MdContest[] => {
  let lines = md.split("\n")

  let results = [] as MdContest[]

  let name: string = ""
  let nameHashCount = 10
  let status = "unknown" as MdStatus

  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i]
    let lineStatus = getStatus(line)
    if (lineStatus) status = lineStatus

    let lineHashMatch = line.match(/^#{1,3} /)
    if (lineHashMatch && lineHashMatch[0].length < nameHashCount) {
      nameHashCount = line.match(/^#{1,3} /)![0].length
      name = truncateLongContestName(
        line
          .replace(/^#{1,3} /, "")
          .toLowerCase()
          .replace(/ /g, "-")
          .replace("\\", "")
          .replace(/-{1,4}/, "-")
      )
    }

    if (name !== "" && line.startsWith("[View competition](")) {
      if (status === "unknown") {
        sentryError(`cantina status is unknown for ${name}`)
      } else {
        let id = line
          .replace("[View competition](/competitions/", "")
          .replace(")", "")
        let dateLine = lines[i - 2]
        let { start_date, end_date } = getStartEndDate(dateLine)
        let prize = lines[i - 4]
        // let startDate = new Date(start_date * 1000)
        let startYear = new Date(start_date * 1000).getFullYear()
        let startMonth = new Date(start_date * 1000).getMonth() + 1
        name = `${startYear}-${startMonth
          .toString()
          .padStart(2, "0")}-${name.replace("-competition", "")}`

        results.push({ name, id, start_date, end_date, prize, status })
      }

      name = ""
      status = "unknown"
      nameHashCount = 10
    }
  }

  return results
}

let getStatus = (line: string): MdStatus | undefined => {
  line = line
    .trim()
    .toLowerCase()
    .replace(/^#{1,3} /, "")

  if (line === "escalations ended") line = "ended"

  let isSingleWordLine = line.match(/^[a-zA-Z]+$/)
  let isStatusLine =
    isSingleWordLine &&
    statuses.some((it) => it.match(new RegExp(`^${line.trim()}$`)))

  let status

  if (isStatusLine) {
    status = line.trim() as MdStatus
  }

  return status
}

// the date is 8pm UTC
const getStartEndDate = (
  dateLine: string
): {
  start_date: number
  end_date: number
} => {
  dateLine = dateLine.replace(`\\-`, "-")
  dateLine = dateLine.replaceAll("UTC", "")

  // their end date is 8pm UTC
  let startDateStr = dateLine.split(" - ")[0] + "T20:00+00:00"
  let start_date = getAnyDateUTCTimestamp(startDateStr)
  let endDateStr = dateLine.split(" - ")[1] + "T20:00+00:00"
  let end_date = getAnyDateUTCTimestamp(endDateStr)
  if (!start_date || !end_date) {
    throw new Error(`could not parse date from ${dateLine}`)
  }
  return { start_date, end_date }
}
