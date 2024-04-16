import { ContestWithModules } from "ah-shared"
import { getActive } from "./getActive.js"

export const parseActiveHatsContests = async (
  existingContests: ContestWithModules[]
): Promise<ContestWithModules[]> => {
  let active = await getActive()

  active = active.filter((it) => {
    let existing = existingContests.find((existing) => existing.pk === it.name)
    return !existing || existing.modules.length === 0
  })

  // let contests = await Promise.all(active.map((it) => parseContest(it)))

  return []
}
