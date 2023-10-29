import fs from "fs";
import { getPossiblyActiveContests, parseContest, parseReposJobs } from "./codehawks-parser";
import { workingDir } from "../util.js";
import { it, beforeEach, afterEach, expect, vi, describe } from "vitest";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function.js";
describe("", () => {
    beforeEach(() => {
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });
    it("gets possibly active contests", async () => {
        vi.spyOn(Date, "now").mockImplementation(() => 1692751034000);
        mockRepos();
        await getPossiblyActiveContests().then(it => {
            expect(it.length).toBe(3);
        });
    });
    it("parses active contests", async () => {
        vi.spyOn(Date, "now").mockImplementation(() => 1692751034000);
        mockRepos();
        let repos = await getPossiblyActiveContests();
        let parseJob = parseReposJobs(repos, []);
        let contests = await parseJob;
        contests = contests.filter(it => it !== undefined);
        let contest = contests[0];
        expect(contests.length).toBe(1);
        expect(contest.pk).toBe("2023-08-sparkn");
        expect(contest.modules.length).toBe(3);
        expect(contest.modules[0].path).toBe("src/ProxyFactory.sol");
        expect(contest.modules[1].path).toBe("src/Distributor.sol");
        expect(contest.modules[2].path).toBe("src/Proxy.sol");
    });
    it("parses ditto modules", async () => {
        vi.spyOn(Date, "now").mockImplementation(() => 1694827901000);
        vi.stubGlobal("fetch", async (url) => {
            if (!url.includes("raw.githubusercontent.com") &&
                !url.includes("/main/contracts/")) {
                return Promise.resolve({
                    status: 404
                });
            }
            else if (url.includes("/main/contracts/")) {
                return Promise.resolve({
                    status: 200,
                });
            }
        });
        let dir = await workingDir();
        let dittoReadme = fs.readFileSync(`${dir}/src/codehawks/test/2023-09-ditto.md`).toString();
        await parseContest("2023-09-ditto", "https://github.com/Cyfrin/2023-09-ditto", dittoReadme);
        let res = pipe(await parseContest("2023-09-ditto", "https://github.com/Cyfrin/2023-09-ditto", dittoReadme), E.getOrElseW((e) => {
            console.log(e);
            throw new Error(e);
        }));
        expect(res.modules.length).toBe(26);
        expect(res.modules[0].url).toContain("/main/contracts/");
    });
    it("parses steadefi modules", async () => {
        vi.spyOn(Date, "now").mockImplementation(() => 1698571994000);
        vi.stubGlobal("fetch", async (url) => {
            if (!url.includes("raw.githubusercontent.com") &&
                !url.includes("/main/contracts/")) {
                return Promise.resolve({
                    status: 404
                });
            }
            else if (url.includes("/main/contracts/")) {
                return Promise.resolve({
                    status: 200,
                });
            }
        });
        let dir = await workingDir();
        let dittoReadme = fs.readFileSync(`${dir}/src/codehawks/test/2023-10-steadefi.md`).toString();
        await parseContest("2023-10-steadefi", "https://github.com/Cyfrin/2023-10-steadefi", dittoReadme);
        let res = pipe(await parseContest("2023-10-steadefi", "https://github.com/Cyfrin/2023-10-steadefi", dittoReadme), E.getOrElseW((e) => {
            console.log(e);
            throw new Error(e);
        }));
        expect(res.modules.length).toBe(22);
        expect(res.modules[0].url).toContain("/contracts/interfaces/oracles/IChainlinkOracle.sol");
    });
    const mockRepos = async () => {
        let dir = workingDir();
        let repos = fs.readFileSync(`${dir}/src/codehawks/test/codehawks-repos.json`).toString();
        let sparknReadme = fs.readFileSync(`${dir}/src/codehawks/test/2023-08-sparkn.md`).toString();
        vi.stubGlobal("fetch", async (url, params) => Promise.resolve({
            text: () => {
                if (url.includes("/repos")) {
                    return Promise.resolve(repos);
                }
                else if (url.includes("/README.md")) {
                    if (url.includes("sparkn")) {
                        return Promise.resolve(sparknReadme);
                    }
                }
                else {
                    return Promise.resolve("");
                }
            }
        }));
        return JSON.parse(repos);
    };
});
//# sourceMappingURL=codehawks-parser.test.js.map