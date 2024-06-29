import { getAnyDateUTCTimestamp } from "../util.js"

import { MdContest, MdStatus, statuses } from "./types.js"

export const parseMd = (md: string): MdContest[] => {
  let boosts = md.split(/\n#{1,6}.*Boost/)[1].split(/\n#{1,3} /)[0]
  let lines = boosts.split("\n")

  let results = [] as MdContest[]
  let status = "unknown" as MdStatus

  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i]
    let lineStatus = getStatus(line)
    if (lineStatus) status = lineStatus

    if (
      line.startsWith("[View boost](") ||
      line.startsWith("[View results](")
    ) {
      let id
      if (line.startsWith("[View boost](")) {
        id = line.replace("[View boost](/bounty/", "").replace("/)", "")
      } else {
        id = line.replace("[View results](/bounty/", "").replace("/)", "")
      }

      let prize = lines[i - 4].trim()

      let name = id
      results.push({ name, id, prize, status })
      status = "unknown"
    }
  }

  return results
}

let getStatus = (line: string): MdStatus | undefined => {
  line = line
    .trim()
    .toLowerCase()
    .replace(/^#{1,3} /, "")
  // let isSingleWordLine = line.match(/^[a-zA-Z]+$/)
  let regexpEscaped = line.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  let isStatusLine =
    // isSingleWordLine &&
    statuses.some((it) => it.match(new RegExp(`^${regexpEscaped}$`)))

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
