import { getActiveContests } from "./list/getActive.js";
import { Logger } from "jst-logger";
import { pipe, TE } from "ti-fptsu/lib";
import { log } from "ti-fptsu/log";
// this returns all from the hacken web site
export const parseActiveHackenContests = async (existingContests) => await pipe(TE.fromTask(() => getActiveContests()), log((active) => `hacken: active contests: ${active.map((it) => it.name).join(", ")}`), 
// TE.map((active) =>
//   active.filter((it) => {
//     let existing = existingContests.find((existing) => existing.pk === it.name)
//     return !existing || existing.modules?.length === 0
//   }),
// ),
// TE.chain((it) =>
//   sequence(TE.ApplicativePar)(it.map((it) => TE.fromTask(() => parseContest(it)))),
// ),
TE.chain(() => TE.of([])), TE.getOrElse((e) => {
    Logger.error(`error parsing hacken contests: ${e}`);
    return () => Promise.resolve([]);
}))();
//# sourceMappingURL=hackenParser.js.map