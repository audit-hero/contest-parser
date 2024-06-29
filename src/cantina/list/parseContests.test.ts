import fs from "fs"
import { parseMd } from "./parseContests.js"
import {vi, it, expect } from "vitest"

it("parses status", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 1706517247000)

  let mockContests = fs
    .readFileSync("src/cantina/test/withUpcoming.md")
    .toString()

  let contests = parseMd(mockContests)
  expect(contests.length).toBe(7)
  
  let live = contests.filter((it) => it.status === "live")
  expect(live.length).toBe(1)
  expect(live[0].end_date).toBe(1706558400)
  expect(contests.filter((it) => it.status === "upcoming").length).toBe(1)
  expect(contests.filter((it) => it.status === "judging").length).toBe(2)
  expect(contests.filter((it) => it.status === "escalations").length).toBe(3)
})
