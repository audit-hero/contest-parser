import { afterEach, beforeEach } from "node:test"
import { C4Contest } from "../types.js"
import { parseC4Contest, parseMd } from "./c4ContestParser"
import { it, describe, expect, vi } from "vitest"
import fs from "fs"
import { getTimestamp, findModules, getHmAwards } from "./parse-utils.js"

// commented tests should use the main method, not internal method

describe("", () => {
  // https://code4rena.com/contests/2023-05-juicebox-buyback-delegate
  let contest: C4Contest = {
    amount: "$24,500 USDC",
    contestid: 237,
    details:
      "Thousands of projects use Juicebox to fund, operate, and scale their ideas & communities transparently on Ethereum.",
    end_time: "2023-05-22T20:00:00.000Z",
    hide: false,
    league: "eth",
    repo: "https://github.com/code-423n4/2023-05-juicebox",
    findingsRepo: "https://github.com/code-423n4/2023-05-juicebox-findings",
    start_time: "2023-05-18T20:00:00.000Z",
    sponsor: "Juicebox",
    title: "Juicebox Buyback Delegate",
    slug: "2023-07-chainlink-cross-chain-contract-administration-multi-signature-contract-timelock-and-call-proxies",
  } as any

  afterEach(() => {})

  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it("parses urls", async () => {
    let parsed = await parseC4Contest(contest)
    if (!parsed.ok) throw new Error("failed to parse contest")
    else {
      expect(parsed.value).toBeTruthy()
      expect(parsed.value.doc_urls).toHaveLength(9)
    }
  })

  it("parses docs", async () => {
    let mocks = await vi.hoisted(async () => {
      let fs = await import("fs")

      return {
        md: fs.readFileSync(`./src/c4/test/2023-09-maia.md`).toString(),
      }
    })

    vi.mock("axios", async (imp) => {
      const actual = (await imp()) as any

      return {
        default: {
          get: async (url: string) => {
            return {
              data: mocks.md,
            }
          },
        },
      }
    })

    let parsed = await parseC4Contest(contest)
  })

  let contestObj = {
    start_time: "September 26, 2022 20:00 UTC",
    end_time: "September 29, 2022 20:00 UTC",
    amount: "100$",
  } as unknown as C4Contest

  it("parses correct contracts", () => {
    var md = fs
      .readFileSync(`./src/c4/test/correct-contracts.md`)
      .toString() as string

    let contest = (parseMd("url", md, "repo", contestObj) as any).value

    expect(contest.start_date).toBe(getTimestamp(contestObj.start_time))
    expect(contest.end_date).toBe(getTimestamp(contestObj.end_time))
    expect(contest.modules.length).toBe(13)
  })

  it("handles readme with invalid contracts ", () => {
    var md = fs
      .readFileSync(`./src/c4/test/invalid-contracts.md`)
      .toString() as string

    let contest = (parseMd("url", md, "repo", contestObj) as any).value

    expect(contest.modules.length).toBe(4)
  })

  it("parser relative urls", async () => {
    var md = fs.readFileSync(`./src/c4/test/c4-relative-urls.md`).toString()
    let parsed = findModules("repo", md.split("\n"), 0)
    expect(parsed.modules).toHaveLength(107)
  })

  it("parses slash-ending urls", async () => {
    var md = fs
      .readFileSync(`./src/c4/test/c4-slash-ending-url.md`)
      .toString() as string
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

    let awards = getHmAwards({} as any, lines.split("\n"))

    expect(awards).toEqual("27637")
  })

  it("parses hm awards with commas", () => {
    let lines = `# Basin Contest Details
    - Total Prize Pool: $40,000 USDC 
      - High/Medium awards: $27,637.50 USDC
      `

    let awards = getHmAwards({} as any, lines.split("\n"))
    expect(awards).toEqual("27637")
  })

  it("parses kelp", async () => {
    let md = fs.readFileSync(`./src/c4/test/2023-11-kelp.md`).toString()

    let parsed = parseMd("url", md, "repo", contest)
    if (!parsed.ok) throw new Error("failed to parse contest")
    else {
      let modules = parsed.value.modules
      expect(modules.length).toBe(10)

      modules.forEach((m) => {
        expect(m.name.endsWith(".sol")).toBeTruthy()
        expect(m.path!.endsWith(".sol")).toBeTruthy()
      })
    }
  })
})
