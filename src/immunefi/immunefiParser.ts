import { ContestWithModules } from "ah-shared"
import { parseContest } from "./parseContest.js"
import { scrape } from "../web-load/playwright-loader.js"
import { MdContest } from "./types.js"
import * as list from "./parseContests.js"

let listUrl = "https://immunefi.com/boost/"

// this returns all from the cantina web site
export const parseActiveImmunefiContests = async (
  existingContests: ContestWithModules[]
): Promise<ContestWithModules[]> => {
  let active = await getActiveContests()

  active = active.filter((it) => {
    let existing = existingContests.find((existing) => existing.pk === it.name)
    return !existing || existing.modules?.length === 0
  })

  let contests = await Promise.all(active.map((it) => parseContest(it)))

  return contests
}

export const getAllContests = async (): Promise<MdContest[]> => {
  let md = await getHtmlAsMd()
  return list.parseMd(md)
}

export const getActiveContests = async () => {
  let allContests = await getAllContests()

  return allContests.filter((it) => {
    return it.status === "live" || it.status === "starting in"
  })
}

const getHtmlAsMd = async () => {
  return (await scrape(listUrl, [])).content
}
