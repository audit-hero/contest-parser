import { vi, it, expect, afterEach } from "vitest";
import { parseMd } from "./parseContest.js";
import fs from "fs";
afterEach(() => {
    vi.clearAllMocks();
});
it("parses modules", () => {
    let mdContest = {
        id: "8409a0ce-6c21-4cc9-8ef2-bd77ce7425af",
        name: "morpho-metamorpho-and-periphery",
        timeframe: {
            start: "2021-11-16T00:00:00Z",
            end: "2021-12-07T00:00:00Z",
        },
        totalRewardPot: "100000",
        currencyCode: "USDC",
        status: "live",
    };
    let contestMd = fs.readFileSync("src/cantina/test/morpho.md").toString();
    let contest = parseMd(mdContest, contestMd);
    // the spec changes all the time
    expect(contest.modules.length).toBe(10);
    expect(contest.doc_urls?.at(1)).toBe("https://www.notion.so/00ff8194791045deb522821be46abbdc?pvs=21");
});
//# sourceMappingURL=parseContest.test.js.map