import { ContestWithModules } from "ah-shared"
import { getActiveContests } from "./list/getActive.js"
import { parseContest } from "./contest/parseContest.js"
import { Logger } from "jst-logger"
import { pipe, TE } from "ti-fptsu/lib"
import { log } from "ti-fptsu/log"
import { sequence } from "fp-ts/lib/Array.js"

// this returns all from the cantina web site
export const parseActiveCantinaContests = async (
  existingContests: ContestWithModules[],
): Promise<ContestWithModules[]> =>
  await pipe(
    TE.fromTask(() => getActiveContests()),
    // TE.map((it) => it.filter((it) => it.name.includes("royco"))),
    log((active) => `cantina: active contests: ${active.map((it) => it.name).join(", ")}`),
    TE.map((active) =>
      active.filter((it) => {
        let existing = existingContests.find((existing) => existing.pk === it.name)
        return !existing || existing.modules?.length === 0
      }),
    ),
    TE.chain((it) =>
      sequence(TE.ApplicativePar)(it.map((it) => TE.fromTask(() => parseContest(it)))),
    ),
    TE.getOrElse((e) => {
      Logger.error(e)
      return () => Promise.resolve([] as ContestWithModules[])
    }),
  )()
