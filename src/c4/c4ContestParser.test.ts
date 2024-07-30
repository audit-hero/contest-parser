import { afterEach, beforeEach } from "node:test"
import { C4Contest } from "../types.js"
import { parseC4Contest } from "./c4ContestParser.js"
import { it, describe, expect, vi } from "vitest"
import fs from "fs"
import { getHmAwards } from "./parse-utils.js"
import { getTimestamp, findModules } from "./c4ModulesParser.js"

describe("", () => {
  afterEach(() => {})

  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  let contestObj = {
    slug: "2024-06-size",
    trimmedSlug: "2024-06-size",
  } as C4Contest

  it("parses correct contracts", async () => {
    vi.mock("../util.js", async () => {
      let actual = (await vi.importActual("../util.js")) as any
      return {
        ...actual,
        getHtmlAsMd: async () => fs.readFileSync(`./src/c4/test/md/2024-06-size.md`).toString(),
      }
    })

    let it = await parseC4Contest(contestObj)
    if (!it.ok) throw new Error("failed to parse contest")
    expect(it.value.start_date).toBe(getTimestamp("June 10, 2024 20:00 UTC"))
    expect(it.value.end_date).toBe(getTimestamp("July 2, 2024 20:00 UTC"))
    expect(it.value.modules.length).toBe(34)
  })

  it("parser relative urls", async () => {
    var md = fs.readFileSync(`./src/c4/test/c4-relative-urls.md`).toString()
    let parsed = findModules("repo", md.split("\n"), 0)
    expect(parsed.modules).toHaveLength(104)
  })

  it("parses slash-ending urls", async () => {
    var md = fs.readFileSync(`./src/c4/test/c4-slash-ending-url.md`).toString() as string
    let parsed = findModules("repo", md.split("\n"), 0)
    expect(parsed.modules[18].url?.slice(-3)).toBe("sol")
    expect(parsed.modules[18].name).toBe("OracleConvert.sol")
  })

  it("parses hm awards", () => {
    let lines = `# Basin Contest Details
    - Total Prize Pool: $40,000 USDC 
      - HM awards: $27,637.50 USDC 
      - Analysis awards: $1,675 USDC 
      `

    let awards = getHmAwards(lines.split("\n"))

    expect(awards).toEqual("27637")
  })

  it("parses hm awards with commas", () => {
    let lines = `# Basin Contest Details
    - Total Prize Pool: $40,000 USDC 
      - High/Medium awards: $27,637.50 USDC
      `

    let awards = getHmAwards(lines.split("\n"))
    expect(awards).toEqual("27637")
  })
})
