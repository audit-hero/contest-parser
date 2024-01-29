import fs from "fs"
import { parseMd } from "./parseContests"
import { it, expect } from "vitest"

it("parses status", async () => {
  let mockContests = fs
    .readFileSync("src/cantina/test/withUpcoming.md")
    .toString()

  let contests = parseMd(mockContests)
  expect(contests.length).toBe(7)

  expect(contests.filter((it) => it.status === "live").length).toBe(1)
  expect(contests.filter((it) => it.status === "upcoming").length).toBe(1)
  expect(contests.filter((it) => it.status === "judging").length).toBe(2)
  expect(contests.filter((it) => it.status === "escalations").length).toBe(3)
})
