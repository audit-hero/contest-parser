import { loadNextProps } from "../../web-load/load-next-props.js";
export const getAllContests = async () => (await loadNextProps("https://cantina.xyz/competitions")).competitions;
export const getActiveContests = async () => {
    let allContests = await getAllContests();
    return allContests.filter((it) => it.status === "live");
};
//# sourceMappingURL=getActive.js.map