import { loadNuxtProps } from "../../web-load/load-next-props.js";
import { parseNuxtData } from "./parseNuxt.js";
// prettier-ignore
export const getAllContests = async () => {
    const data = await loadNuxtProps("https://hackenproof.com/audit-programs/");
    let parsed = parseNuxtData(data);
    return parsed;
};
export const getActiveContests = async () => {
    let allContests = await getAllContests();
    return allContests.filter((it) => it.status === "LIVE");
};
//# sourceMappingURL=getActive.js.map