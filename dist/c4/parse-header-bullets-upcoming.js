import { NO_START_END } from "../errors.js";
import { getHeaderBullets, getTimeFromBullets } from "./parse-header-bullets-active.js";
import { E, O, pipe } from "ti-fptsu/lib";
export let parseBulletsUpcoming = (md) => {
    return pipe(E.Do, E.bind("contest", () => getContestParagraph(md)), E.bind("startEnd", ({ contest }) => getStartEndTime(contest)), E.bind("prize", ({ contest }) => getAwards(contest)), E.bind("readme", ({ contest }) => getReadme(contest)), E.map(({ startEnd, prize, readme }) => ({
        start_date: startEnd.start_date,
        end_date: startEnd.end_date,
        prize,
        readme,
    })));
};
let getContestParagraph = (md) => 
// last paragraph. fail if doesn't exists
pipe(O.fromNullable(md.split(/^# /m).pop()), O.map((it) => `# ${it}`), E.fromOption(() => new Error("No contest paragraph found")));
let getStartEndTime = (contest) => {
    let bullets = getHeaderBullets(contest);
    return pipe(O.Do, O.apS("start_date", getTimeFromBullets(bullets, "Start date")), O.apS("end_date", getTimeFromBullets(bullets, "End date")), E.fromOption(() => new Error(NO_START_END)));
};
let getAwards = (contest) => pipe(getHeaderBullets(contest), (bullets) => bullets
    .find((it) => it.match(/[aA]wards/))
    ?.split(/[aA]wards/)[1]
    .replace(" in ", " "), O.fromNullable, E.fromOption(() => new Error("No awards found")), E.orElse(() => E.right("")));
let getReadme = (contest) => pipe(getHeaderBullets(contest), (bullets) => bullets[0], (firstBullet) => contest.split(firstBullet), (it) => it.at(0) || "", // always return
O.fromNullable, E.fromOption(() => new Error("No readme found")));
//# sourceMappingURL=parse-header-bullets-upcoming.js.map