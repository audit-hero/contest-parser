import { getAnyDateUTCTimestamp, truncateLongContestName } from "../util.js"
import anyDate from "any-date-parser"
import { HawksMdContest, MdStatus, statuses } from "./types.js"
import { sentryError } from "ah-shared"

export const parseMd = (md: string): HawksMdContest[] => {
  let lines = md.split("\n")

  let results = [] as HawksMdContest[]

  let name: string = ""
  let status = "unknown" as MdStatus
  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i]
    let lineStatus = getStatus(line)
    if (lineStatus) status = lineStatus

    if (line.match(/^#{1,4} /) && !line.match(/\$/)) {
      name = truncateLongContestName(
        line
          .trim()
          .replace(/^#{1,4} /, "")
          .toLowerCase()
          .replace(/( |\.)/g, "-")
          .replace("\\", "")
          .replace(/-{2,4}/, "-")
      )
    }

    if (name !== "" && line.startsWith("[view](")) {
      let id = line.replace("[view](contests/", "").replace(")", "")
      let dateLine = lines[i - 4]
      // note: contest parser parses to more specific date
      let { start_date, end_date } = getStartEndDate(dateLine)
      let prize = lines[i - 2].replace(/^#{1,4} /, "")

      name = getContestName(start_date, name)

      if (status === "unknown") {
        sentryError(
          `unknown contest status for ${name}. Try adding the new status codehawks types`
        )
      } else {
        results.push({ name, id, start_date, end_date, prize, status })
      }

      name = ""
      status = "unknown"
    }
  }

  return results
}

let getContestName = (start_date: number, name: string) => {
  let startYear = new Date(start_date * 1000).getFullYear()
  let startMonth = new Date(start_date * 1000).getMonth() + 1
  return `${startYear}-${startMonth.toString().padStart(2, "0")}-${name}`
}

let getStatus = (line: string): MdStatus | undefined => {
  line = line
    .trim()
    .toLowerCase()
    .replace(/^#{1,3} /, "")

  let isStatusLine = statuses.some((it) =>
    it.match(new RegExp(`^${line.trim()}$`))
  )

  let status

  if (isStatusLine) {
    status = line.trim() as MdStatus
  }

  return status
}

// the date is 12pm UTC
const getStartEndDate = (
  dateLine: string
): {
  start_date: number
  end_date: number
} => {
  // "Ends in 3 days (Jan 30th — Feb 3rd)"
  dateLine = dateLine.match(/\(([^)]+)\)/)![1]
  let split = dateLine.split(" — ")
  if (split.length === 1) split = dateLine.split(" — ")

  // their end date is 8pm UTC
  let startDateStr = split[0] + "T12:00+00:00"
  let start_date = getAnyDateUTCTimestamp(anyDate.attempt(startDateStr))
  let endDateStr = split[1] + "T12:00+00:00"
  let end_date = getAnyDateUTCTimestamp(anyDate.attempt(endDateStr))
  return { start_date, end_date }
}
