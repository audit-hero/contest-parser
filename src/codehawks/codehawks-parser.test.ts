import fs from "fs"
import { getPossiblyActiveContests, parseContest, parseReposJobs } from "./codehawks-parser"
import { workingDir } from "../util.js"
import { Repo } from "ah-shared"
import { it, beforeEach, afterEach, expect, vi } from "vitest"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/lib/function.js"

beforeEach(() => {

})

afterEach(() => {
  vi.clearAllMocks()
})

it("gets possibly active contests", () => {
  vi.spyOn(Date, "now").mockImplementation(() => 1692751034000)

  loadRepos()

  getPossiblyActiveContests().then(it => {
    expect(it.length).toBe(4)
  })
})

it("parses active contests", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 1692751034000)

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

it("parses ditto modules", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 1694827901000)

  let dir = await workingDir()

  let dittoReadme = fs.readFileSync(`${dir}/src/codehawks/test/2023-09-ditto.md`).toString()

  let res = pipe(
    await parseContest("ditto", "https://ditto", dittoReadme),
    E.getOrElseW((e: string) => {
      console.log(e)
      throw new Error(e)
    })
  )

  expect(res.modules.length).toBe(26)
})

const loadRepos = async () => {
  let dir = await workingDir()
  let repos = fs.readFileSync(`${dir}/src/codehawks/test/codehawks-repos.json`).toString()
  let sparknReadme = fs.readFileSync(`${dir}/src/codehawks/test/2023-08-sparkn.md`).toString()

  global.fetch = vi.fn((url: any) => Promise.resolve({
    text: () => {
      if (url.includes("/repos")) {
        return Promise.resolve(repos)
      }
      else if (url.includes("/README.md")) {
        if (url.includes("sparkn")) {
          return Promise.resolve(sparknReadme)
        }
      }
      else {
        return Promise.resolve("")
      }
    }
  } as any))

  return JSON.parse(repos) as Repo[]
}