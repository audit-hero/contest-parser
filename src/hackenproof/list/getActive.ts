import { loadNuxtProps } from "../../web-load/load-next-props.js"
import { HackenproofContest, parseNuxtData } from "./parseNuxt.js"

// prettier-ignore
export const getAllContests = async (): Promise<HackenproofContest[]> => {
  const data = await loadNuxtProps("https://hackenproof.com/audit-programs/")
  let parsed = parseNuxtData(data)
  return parsed
}

export const getActiveContests = async () => {
  let allContests = await getAllContests()
  return allContests.filter((it) => it.status === "LIVE")
}
