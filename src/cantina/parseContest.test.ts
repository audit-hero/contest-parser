import { vi, it, expect, afterEach } from "vitest"
import { getAllContests } from "./getActive.js"
import { MdContest } from "./types.js"
import { parseMd } from "./parseContest.js"
import fs from "fs"

afterEach(() => {
  vi.clearAllMocks()
})

it("parses modules", () => {
  let mdContest: MdContest = {
    id: "8409a0ce-6c21-4cc9-8ef2-bd77ce7425af",
    name: "morpho-metamorpho-and-periphery",
    start_date: 1637059200000,
    end_date: 1638864000000,
    prize: "$100,000 USDC",
    status: "live",
  }

  let contestMd = fs.readFileSync("src/cantina/test/morpho.md").toString()

  let contest = parseMd(mdContest, contestMd)

  // the spec changes all the time
  expect(contest.modules.length).toBe(10)
  expect(contest.doc_urls?.at(1)).toBe(
    "https://www.notion.so/00ff8194791045deb522821be46abbdc?pvs=21"
  )
})
