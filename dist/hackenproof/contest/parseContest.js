import { trimContestName } from "../../util.js";
export const parseContest = async (contest) => {
    return convertContest(contest);
};
export const convertContest = (contest) => {
    let name = contest.name;
    let startDate = new Date(contest.startDate).getTime() / 1000;
    let endDate = new Date(contest.endDate).getTime() / 1000;
    let active = contest.status === "LIVE" ? 1 : 0;
    let modules = [];
    let result = {
        pk: trimContestName(name, startDate),
        readme: contest.name + "\n\n" + contest.description,
        start_date: startDate,
        end_date: endDate,
        platform: "hackenproof",
        sk: "0",
        url: `https://hackenproof.com/audit-programs/${contest.slug}`,
        active: active,
        status: mdStatusToStatus(contest.status),
        modules: modules,
        doc_urls: [],
        prize: contest.reward,
        tags: [],
        repo_urls: [contest.repoUrl],
    };
    return result;
};
let mdStatusToStatus = (status) => {
    if (status === "LIVE")
        return "active";
    if (status === "ENDED")
        return "finished";
    throw new Error(`Unknown status: ${status}`);
};
//# sourceMappingURL=parseContest.js.map