import { afterEach } from "node:test";
import { parseSherlockContest } from "./sherlockContestParser.js";
import { it, vi, describe, expect } from "vitest";
describe("", () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });
    // https://code4rena.com/contests/2023-05-juicebox-buyback-delegate
    let contest = {
        calc_completed: false,
        description: "The Index Coop builds decentralized structured products that make crypto simple, accessible, and secure",
        ends_at: 1686754800,
        escalation_started_at: null,
        id: 81,
        judging_ends_at: 1686841200,
        judging_prize_pool: 4300,
        judging_repo_name: "sherlock-audit/2023-05-Index-judging",
        lead_judge_fixed_pay: 4300,
        lead_judge_handle: "stopthecap",
        lead_senior_auditor_fixed_pay: 35000,
        lead_senior_auditor_handle: "0x52",
        logo_url: "https://sherlock-files.ams3.digitaloceanspaces.com/contests/Index.jpg",
        private: false,
        prize_pool: 87000,
        rewards: 130600,
        score_sequence: null,
        short_description: "The Index Coop builds decentralized structured products that make crypto simple, accessible, and secure",
        starts_at: 1684508400,
        status: "RUNNING",
        template_repo_name: "sherlock-audit/2023-05-Index",
        title: "Index",
    };
    it("parses no docs contest", async () => {
        await mockContest();
        // sherlock contests seem to have no docs. only the repository
        let parsed = await parseSherlockContest(contest);
        expect(parsed.ok).toBeTruthy();
        if (!parsed.ok)
            return;
        expect(parsed.value).toBeTruthy();
        expect(parsed.value?.doc_urls).toHaveLength(0);
        expect(parsed.value?.modules).toHaveLength(27);
    });
    const mockContest = async () => {
        const mocks = await vi.hoisted(async () => {
            let fs = await import("fs-extra");
            return {
                contest: JSON.parse(fs.readFileSync(`./src/sherlock/test/test-contest.json`).toString()),
                readme: fs.readFileSync(`./src/sherlock/test/test-readme.md`).toString(),
            };
        });
        vi.stubGlobal("fetch", async (url) => Promise.resolve({
            text: async () => {
                if (url.includes("contests/81")) {
                    return mocks.contest;
                }
                else if (url.includes("raw.githubusercontent.com/sherlock-audit")) {
                    return mocks.readme;
                }
            },
        }));
    };
});
//# sourceMappingURL=sherlockContestParser.test.js.map