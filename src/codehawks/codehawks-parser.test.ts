import fs from "fs"
import { getPossiblyActiveContests, parseReposJobs } from "./codehawks-parser"
import { workingDir } from "../util.js"
import { Repo } from "ah-shared"
import { it, beforeEach, afterEach, expect, vi } from "vitest"

beforeEach(() => {
  // Date.now() return August 23 2023
  vi.spyOn(Date, "now").mockImplementation(() => 1692751034000)
})

afterEach(() => {
  vi.clearAllMocks()
})

it("gets possibly active contests", () => {
  loadRepos()

  getPossiblyActiveContests().then(it => {
    expect(it.length).toBe(4)
  })
})

it("parses active contests", async () => {
  let repos = await getPossiblyActiveContests()

  let parseJob = parseReposJobs(repos, [])
  let contests = await parseJob
  contests = contests.filter(it => it !== undefined)
  let contest = contests[0]!

  expect(contests.length).toBe(1)
  expect(contest.pk).toBe("2023-08-sparkn")
  expect(contest.modules.length).toBe(3)
  expect(contest.modules[0].path).toBe("src/ProxyFactory.sol")
  expect(contest.modules[1].path).toBe("src/Distributor.sol")
  expect(contest.modules[2].path).toBe("src/Proxy.sol")
})

const loadRepos = async () => {
  let dir = await workingDir()
  let repos = fs.readFileSync(`${dir}/src/codehawks/test/codehawks-repos.json`).toString()
  let readme = fs.readFileSync(`${dir}/src/codehawks/test/codehawks-2023-08-sparkn.md`).toString()

  global.fetch = vi.fn((url: any) => Promise.resolve({
    text: () => {
      if (url.includes("/repos")) {
        return Promise.resolve(repos)
      }
      else if (url.includes("/README.md") && url.includes("sparkn")) {
        return Promise.resolve(readme)
      }
      else {
        return Promise.resolve("")
      }
    }
  } as any))

  return JSON.parse(repos) as Repo[]
}