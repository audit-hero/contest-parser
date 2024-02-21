import { vi, it, expect, afterEach } from "vitest"
import { MdContest } from "./types.js"
import { parseMd } from "./parseContest.js"
import fs from "fs"

afterEach(() => {
  vi.clearAllMocks()
})

it("parses modules", () => {
  let mdContest: MdContest = {
    id: "ebtc-boost",
    name: "ebtc-boost",
    // start_date: 1637059200000,
    // end_date: 1638864000000,
    prize: "$200,000 USDC",
    status: "live",
  }

  let contestMd = fs.readFileSync("src/immunefi/test/eBTC.md").toString()

  let contest = parseMd(mdContest, contestMd)
  expect(contest.modules.length).toBe(12)

  expect(contest.modules[0].url).toBe(
    "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/ActivePool.sol"
  )
  expect(contest.modules[0].name).toBe("ActivePool.sol")
})
