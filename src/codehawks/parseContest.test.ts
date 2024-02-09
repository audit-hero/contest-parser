import { vi, it, expect, afterEach } from "vitest"
import { HawksMdContest } from "./types.js"
import { parseMd } from "./parseContest.js"
import fs from "fs"

afterEach(() => {
  vi.clearAllMocks()
})

it("parses modules", () => {
  let mdContest: HawksMdContest = {
    id: "clrzgrole0007xtsq0gfdw8if",
    name: "2024-01-morpheusai",
    start_date: 1706616000,
    end_date: 1706961600,
    prize: "$22,500 USDC",
    status: "live",
  }

  let contestMd = fs.readFileSync("src/codehawks/test/morpheusai.md").toString()

  let contest = parseMd(mdContest, contestMd)

  expect(contest.modules.length).toBe(23)
  expect(contest.doc_urls?.at(3)).toBe(
    "https://mor.org"
  )

  expect(contest.start_date).toBe(1706616000)
  expect(contest.end_date).toBe(1706961600)
})

it("uses main repo if scope has no repo", () => {
  let mdContest: HawksMdContest = {
    id: "clrzgrole0007xtsq0gfdw8if",
    name: "2024-01-morpheusai",
    start_date: 1706616000,
    end_date: 1706961600,
    prize: "$22,500 USDC",
    status: "live",
  }

  let contestMd = fs.readFileSync("src/codehawks/test/stakelink.md").toString()

  let contest = parseMd(mdContest, contestMd)

  expect(contest.modules.length).toBe(10)
  contest.modules.forEach((it) => {
    expect(it.url?.startsWith("https://github.com/Cyfrin/2023-12-stake-link/tree/main")).toBe(true)
  })
})