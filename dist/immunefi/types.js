import { trimContestName } from "../util.js";
export let isActive = (contest) => {
    return (new Date(contest.endDate) > new Date());
};
export let toId = (contest) => {
    return trimContestName(contest.id, new Date(contest.launchDate).getTime() / 1000);
};
//# sourceMappingURL=types.js.map