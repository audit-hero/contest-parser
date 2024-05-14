import { ContestWithModules } from "ah-shared"
import { getActiveContests } from "./getActive.js"
import { parseContest } from "./parseContest.js"

// this returns all from the cantina web site
export const parseActiveCantinaContests = async (
  existingContests: ContestWithModules[]
): Promise<ContestWithModules[]> => {
  let active = await getActiveContests()

  active = active.filter((it) => {
    let existing = existingContests.find((existing) => existing.pk === it.name)
    return !existing || existing.modules?.length === 0
  })

  let contests = await Promise.all(active.map((it) => parseContest(it)))

  return contests
}
