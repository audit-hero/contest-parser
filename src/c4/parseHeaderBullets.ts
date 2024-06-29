import { getAnyDateUTCTimestamp } from "../util.js"
import { getHmAwards } from "./parse-utils.js"
import { E, O, pipe } from "ti-fptsu/lib"

export let NO_START_END = "no start/end time found"

export let parseHeaderBullets = (md: string) => {
  let bullets = getHeaderBullets(md)

  return pipe(
    getStartEndTime(bullets),
    E.map((it) => ({
      hmAwards: getHmAwards(bullets),
      ...it,
    }))
  )
}

let getStartEndTime = (
  bullets: string[]
): E.Either<Error, { start: number; end: number }> =>
  pipe(
    O.Do,
    O.apS("start", getTimeFromBullets(bullets, "Starts")),
    O.apS("end", getTimeFromBullets(bullets, "Ends")),
    O.map((it) => {
      let { start, end } = it
      return { start, end }
    }),
    E.fromOption(() => new Error(NO_START_END))
  )

let getTimeFromBullets = (bullets: string[], prefix: string) =>
  pipe(
    O.fromNullable(
      bullets
        .reverse()
        .find((it) => it.includes(prefix))
        ?.split(prefix)[1]
        .trim()
    ),
    O.chain((it) => O.fromNullable(getAnyDateUTCTimestamp(it)))
  )

let getHeaderBullets = (md: string) => {
  let split = md.split("\n")
  let firstBullet = split.findIndex((it) => it.trim().startsWith("*"))
  let lastBullet = split
    .slice(firstBullet)
    .findIndex((it) => 
      !it.trim().startsWith("*")
  )

  return split.slice(firstBullet, firstBullet + lastBullet)
}

let usdCoins = ["USDC", "USDT", "DAI", "TUSD", "BUSD", "USDP", "UST"]
export let trimContestAmount = (amount: string) => {
  amount = amount.replace("$$", "$").replace(" in ", " ")

  if (usdCoins.some((it) => amount.includes(it))) {
    amount = amount.replace("$", "").replace(" ", "")
    usdCoins.forEach((it) => {
      amount = amount.replace(it, "")
    })
    amount = amount + " $"
  }

  return amount
}
