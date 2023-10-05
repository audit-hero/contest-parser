import { it, beforeEach, afterEach, expect, vi } from "vitest"

import fs from "fs"
import { getActiveContests, parseContests } from "./hats-parser"
import { workingDir } from "../util"
import { ContestWithModules } from "ah-shared"

beforeEach(() => {
  // Date.now() return August 23 2023
  mockRequests()
  vi.spyOn(Date, "now").mockImplementation(() => 1692751034000)
})

afterEach(() => {
  vi.clearAllMocks()
})

it("gets active contests", async () => {
  let contests = await getActiveContests()
  expect(contests.length).toBe(1)
})

it("parser contest", async () => {
  let contests = await getActiveContests()
  let parsed = await parseContests(contests, [])
  let contest = parsed[0] as ContestWithModules

  expect(contest.pk).toBe("2023-08-stakewise")

  expect(contest.prize).toBe("150000")
  expect(contest.modules.length).toBe(40)
  expect(contest.url).toBe("https://app.hats.finance/audit-competitions/stakewise-0xd91cd6ed6c9a112fdc112b1a3c66e47697f522cd")
  expect(contest.repo_urls![0]).toBe("https://github.com/stakewise/v3-core")
  expect(contest.doc_urls![0]).toBe("https://docs-v3.stakewise.io")
})

const mockRequests = async () => {
  let workDir = await workingDir()
  let repos = fs.readFileSync(`${workDir}/src/hats/test/all-projects.json`).toString()
  let readme = fs.readFileSync(`${workDir}/src/hats/test/stakewise.json`).toString()


  vi.stubGlobal("fetch", async (url: string) => Promise.resolve({
    ok: url.includes("QmdZ8eyN7QyTSnSQBTxbdBZsw3o3YoS9LgBAHoXeGDwLU3"),
    json: () => {
      if (url.includes("https://api.thegraph.com/subgraphs")) {
        return Promise.resolve(JSON.parse(repos))
      }
      else if (url.includes("QmdZ8eyN7QyTSnSQBTxbdBZsw3o3YoS9LgBAHoXeGDwLU3")) {
        return Promise.resolve(JSON.parse(readme))
      }
      else {
        return Promise.resolve("")
      }
    }
  }))
}