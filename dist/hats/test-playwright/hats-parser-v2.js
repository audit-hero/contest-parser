import { getActive } from "./getActive";
export const parseActiveHatsContests = async (existingContests) => {
    let active = await getActive();
    active = active.filter((it) => {
        let existing = existingContests.find((existing) => existing.pk === it.name);
        return !existing || existing.modules.length === 0;
    });
    // let contests = await Promise.all(active.map((it) => parseContest(it)))
    return [];
};
//# sourceMappingURL=hats-parser-v2.js.map