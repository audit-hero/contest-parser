import { loadNextProps } from "../../web-load/load-next-props.js"
import { CantinaContest } from "../types.js"

export const getAllContests = async (): Promise<CantinaContest[]> =>
  (await loadNextProps("https://cantina.xyz/competitions")).competitions

export const getActiveContests = async () => {
  let allContests = await getAllContests()
  return allContests.filter((it) => it.status === "live" || it.status === "upcoming")
}
