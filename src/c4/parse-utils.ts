import { ContestWithModules, Result } from "ah-shared"
import { Logger } from "jst-logger"
import { TE, pipe } from "ti-fptsu/lib"
import { C4Contest } from "../types.js"

export const getHmAwards = (bulletPoints: string[]): string => {
  let hmAwards = ""

  let until = bulletPoints.length * 0.3
  if (until < 10) until = bulletPoints.length
  // modules
  for (let i = 0; i < bulletPoints.length; ++i) {
    let line = bulletPoints[i]

    let trimmed = line.replace(/\\|\//g, "").toLowerCase()

    if (
      (trimmed.includes("hm") || (trimmed.includes("high") && trimmed.includes("medium"))) &&
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

export let convertToResult =
  (contest: C4Contest) => (res: TE.TaskEither<Error, ContestWithModules>) =>
    pipe(
      res,
      TE.fold(
        (err) => {
          Logger.info(`failed to parse ${contest.slug} ${err.message}`)
          return TE.right({
            ok: false,
            error: err,
          } as Result<ContestWithModules>)
        },
        (it) => {
          Logger.info(`parsed ${contest.slug}`)
          return TE.right({ ok: true, value: it } as Result<ContestWithModules>)
        },
      ),
      TE.toUnion,
    )
