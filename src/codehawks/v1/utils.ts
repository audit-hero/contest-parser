import { sentryError } from "ah-shared";
import { pipe } from "fp-ts/lib/function.js";
import { getAnyDateUTCTimestamp } from "../../util.js";
import anyDate from "any-date-parser"

let dateSplitWords = [
  "- starts -",
  "- ends - ",
  "- starts:",
  "- starts",
  "- start:",
  "- start",
  "- ends:",
  "- ends",
  "- end:",
  "- end",
]

export function getStartEndDate(readme: string[]): { startDate: any; endDate: any } {
  let startDate = 0
  let endDate = 0

  upper:for (let line of readme) {
    line = line.toLowerCase()
    /**
    - Starts August 21, 2023
    - Ends August 28th, 2023
     */

    for (let splitWord of dateSplitWords) {
      if (line.includes(splitWord)) {
        let split = line.split(splitWord)
        if (split.length < 2) continue

        let trimmed = pipe(
          split[1].trim(),
          replaceNoonLine,
          replaceUtc,
          moveTimeToEnd
        )
        
        let date = anyDate.attempt(trimmed)
        if (date.invalid) continue

        if (splitWord.includes("start")) startDate = getAnyDateUTCTimestamp(date)
        else endDate = getAnyDateUTCTimestamp(date)

        if (startDate && endDate) break
        continue upper
      }
    }
  }
  if (startDate === 0 || endDate === 0) sentryError(`no start or end date found for ${readme}`)

  return { startDate, endDate }
}


let replaceNoonLine = (date:string) => {
  // convert December 27, 2023 Noon UTC to December 27, 2023 12:00 UTC
  return date.replace("noon utc", "12:00 utc")
}

let replaceUtc = (date:string) => {
  return date.replace(/(utc|gmt)/, '')
}

let moveTimeToEnd = (date:string) => {
  date = date.replace("  ", " ")
  // remove "dd:dd" if it exists, and put it to the end
  let split = date.split(" ")
  if (split.length < 3) return date

  if (split[0].includes(":")) {
    let time = split[0]
    split = split.slice(1)
    split.push(time)
  }

  return split.join(" ")
}
