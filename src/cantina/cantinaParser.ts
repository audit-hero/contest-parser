import { ContestWithModules } from "ah-shared"
import { getActiveContests } from "./list/getActive.js"
import { parseContest } from "./contest/parseContest.js"
import { Logger } from "jst-logger"

// this returns all from the cantina web site
export const parseActiveCantinaContests = async (
  existingContests: ContestWithModules[]
): Promise<ContestWithModules[]> => {
  let active = await getActiveContests()

  active = active.filter((it) => {
    let existing = existingContests.find((existing) => existing.pk === it.name)
    return !existing || existing.modules?.length === 0
  })

  active.forEach((it) => Logger.info(`starting ${it.name}`))

  let contests = await Promise.all(active.map((it) => parseContest(it)))

  return contests
}
