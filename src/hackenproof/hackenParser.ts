import { ContestWithModules } from "ah-shared"
import { getActiveContests } from "./list/getActive.js"
import { parseContest } from "./contest/parseContest.js"
import { Logger } from "jst-logger"
import { pipe, TE } from "ti-fptsu/lib"
import { log } from "ti-fptsu/log"
import { sequence } from "fp-ts/lib/Array.js"

// this returns all from the hacken web site
export const parseActiveHackenContests = async (
  existingContests: ContestWithModules[],
): Promise<ContestWithModules[]> =>
  await pipe(
    TE.fromTask(() => getActiveContests()),
    log((active) => `hacken: active contests: ${active.map((it) => it.name).join(", ")}`),
    TE.map((active) =>
      active.filter((it) => {
        let existing = existingContests.find((existing) => existing.pk === it.name)
        return !existing || existing.modules?.length === 0
      }),
    ),
    TE.chain((contests) =>
      pipe(
        contests.map((contest) => TE.fromTask(() => parseContest(contest))),
        sequence(TE.ApplicativePar),
      ),
    ),
    // TE.chain(() => TE.of([]) as TE.TaskEither<Error, ContestWithModules[]>),
    TE.getOrElse((e) => {
      Logger.error(`error parsing hacken contests: ${e}`)
      return () => Promise.resolve([] as ContestWithModules[])
    }),
  )()
