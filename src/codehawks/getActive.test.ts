import { vi, it, expect } from "vitest"
import { parseMd } from "./parseContests.js"
import fs from "fs"

it("parses", () => {
  vi.spyOn(Date, "now").mockImplementation(() => 1706696367000)

  let websiteAsMd = fs.readFileSync("./src/codehawks/test/website.md", "utf8")

  let contests = parseMd(websiteAsMd)

  let active = contests.filter((it) => it.status !== "completed")

  expect(active.length).toBe(4) // return judging ones as well
  expect(active[0].prize).toBe("$22,500 USDC")
  expect(active[0].name).toBe("2024-01-morpheusai")
  expect(active[1].name).toBe("2024-12-stake-link")
  expect(active[2].name).toBe("2024-12-the-standard")
})
