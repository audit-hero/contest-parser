import { it, describe, afterEach, expect, vi } from "vitest"

import fs from "fs-extra"
import { parseContests } from "./hats-parser.js"
import { getActiveContests } from "./getActiveContests.js"
import { workingDir } from "../util.js"
import { ContestWithModules } from "ah-shared"
import { getModules } from "./hats-parser.modules.js"

describe("", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("gets active contests", async () => {
    mockRequests()
    vi.spyOn(Date, "now").mockImplementation(() => 1692751034000)

    let contests = await getActiveContests()
    expect(contests.length).toBe(2)
  })

  it("parser contest", async () => {
    mockRequests()
    vi.spyOn(Date, "now").mockImplementation(() => 1692751034000)

    let contests = await getActiveContests()
    let parsed = await parseContests(contests, [])
    let contest = parsed[0] as ContestWithModules

    expect(contest.pk).toBe("2023-08-stakewise")

    expect(contest.prize).toBe("150000")
    expect(contest.modules.length).toBe(14)
    expect(contest.url).toBe(
      "https://app.hats.finance/audit-competitions/stakewise-0xd91cd6ed6c9a112fdc112b1a3c66e47697f522cd"
    )
    expect(contest.repo_urls![0]).toBe("https://github.com/stakewise/v3-core")
    expect(contest.doc_urls![0]).toBe("https://docs-v3.stakewise.io")
  })

  it("parses hopr", async () => {
    vi.spyOn(Date, "now").mockImplementation(() => 1696519000000)

    let contestString = fs
      .readFileSync(`${workingDir()}/src/hats/test/hopr.json`)
      .toString()
    let parsed = await parseContests([JSON.parse(contestString)], [])

    expect(parsed[0]?.modules.length).toBe(18)
    expect(parsed[0]?.doc_urls?.at(0)).toBe(
      "https://github.com/hoprnet/hoprnet/tree/master/docs/sc-audit-08-2023/docs"
    )
  })

  it("parses in scope in description", async () => {
    vi.spyOn(Date, "now").mockImplementation(() => 1705590000000)

    let contestString = fs
      .readFileSync(
        `${workingDir()}/src/hats/test/in-scope-in-description.json`
      )
      .toString()
    let parsed = await parseContests([JSON.parse(contestString)], [])

    expect(parsed[0]?.modules.length).toBe(9)
  })

  it("parses in scope in description with format", async () => {
    vi.spyOn(Date, "now").mockImplementation(() => 1705590000000)

    let contestString = fs
      .readFileSync(
        `${workingDir()}/src/hats/test/in-scope-in-description-with-format.json`
      )
      .toString()
    let parsed = await getModules(JSON.parse(contestString), "name")

    // 2 repos
    expect(parsed.length).toBe(23)
    for (let i = 0; i < 10; i++) {
      expect(parsed[i].path?.split("/")[0]).toBe("evm")
    }
    // 10 is README.md
    for (let i = 11; i < 23; i++) {
      expect(parsed[i].path?.split("/")[0]).toBe("src")
    }
  })

  const mockRequests = async () => {
    let workDir = workingDir()
    let repos = fs
      .readFileSync(`${workDir}/src/hats/test/all-projects.json`)
      .toString()
    let readme = fs
      .readFileSync(`${workDir}/src/hats/test/stakewise.json`)
      .toString()

    let myUrls = [
      "QmSkvN3btWFD5Ve68Xax7t5k2Y9rrTgSGWSghzcHUhgD7n",
      "QmdZ8eyN7QyTSnSQBTxbdBZsw3o3YoS9LgBAHoXeGDwLU3",
    ]

    vi.stubGlobal("fetch", async (url: string) => {
      return Promise.resolve({
        ok: myUrls.some((it) => url.includes(it)),
        json: () => {
          if (
            url == "https://api.thegraph.com/subgraphs/name/hats-finance/hats"
          ) {
            return Promise.resolve(JSON.parse(repos))
          } else if (myUrls.some((it) => url.includes(it))) {
            return Promise.resolve(JSON.parse(readme))
          } else {
            return Promise.resolve("")
          }
        },
      })
    }) as any

    // execSync
    vi.mock("child_process", () => {
      return {
        execSync: (cmd: string) => {
          if (cmd.includes("git clone")) {
            fs.mkdirSync(`./tmp/v3-core`, { recursive: true })
            fs.copySync(
              `./src/hats/test/stakewise-repo/`,
              `./tmp/v3-core`
            )
          }
        },
      }
    })
  }
})
