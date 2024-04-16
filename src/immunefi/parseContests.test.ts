import fs from "fs"
import { parseMd } from "./parseContests.js"
import { vi, it, expect } from "vitest"

it("parses status", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 1706517247000)

  let mockContests = fs.readFileSync("src/immunefi/test/index.md").toString()

  let contests = parseMd(mockContests)
  
  expect(contests.filter((it) => it.status === "live").length).toBe(1)
  expect(contests.filter((it) => it.status === "starting in").length).toBe(1)
  expect(contests.filter((it) => it.status === "finished").length).toBe(1)
})
