import { parseC4Contest } from "./c4ContestParser";
// commented tests should use the main method, not internal method
/*
import fs from "fs"

let contestObj = { start_time: "September 26, 2022 20:00 UTC", end_time: "September 29, 2022 20:00 UTC", amount: "100$" } as unknown as C4Contest

test("parses correct contracts", () => {
  var md = fs.readFileSync(`${workingDir}/src/c4/test/correct-contracts.md`).toString() as string;

  let contest = (parseMd("url", md, "repo", contestObj) as any).value

  expect(contest.start_date).toBe(getTimestamp(contestObj.start_time))
  expect(contest.end_date).toBe(getTimestamp(contestObj.end_time))
  expect(contest.modules.length).toBe(13)
}) */
/*
test("handles readme with invalid contracts ", () => {
  var md = fs.readFileSync(`${workingDir}/src/c4/test/invalid-contracts.md`).toString() as string;

  let contest = (parseMd("url", md, "repo", contestObj) as any).value

  expect(contest.modules.length).toBe(4)
}) */
// https://code4rena.com/contests/2023-05-juicebox-buyback-delegate
let contest = {
    "amount": "$24,500 USDC",
    "contestid": 237,
    "details": "Thousands of projects use Juicebox to fund, operate, and scale their ideas & communities transparently on Ethereum.",
    "end_time": "2023-05-22T20:00:00.000Z",
    "hide": false,
    "league": "eth",
    "repo": "https://github.com/code-423n4/2023-05-juicebox",
    "findingsRepo": "https://github.com/code-423n4/2023-05-juicebox-findings",
    "start_time": "2023-05-18T20:00:00.000Z",
    "sponsor": "Juicebox",
    "title": "Juicebox Buyback Delegate",
    "slug": "2023-07-chainlink-cross-chain-contract-administration-multi-signature-contract-timelock-and-call-proxies",
};
it("parses urls", async () => {
    let parsed = await parseC4Contest(contest);
    if (!parsed.ok)
        throw new Error("failed to parse contest");
    else {
        expect(parsed.value).toBeTruthy();
        expect(parsed.value.doc_urls).toHaveLength(8);
    }
});
/*
it("parser relative urls", async () => {
  var md = fs.readFileSync(`${workingDir}/src/c4/test/c4-relative-urls.md`).toString();
  let parsed = findModules("repo", md.split("\n"), 0)
  expect(parsed.modules).toHaveLength(107)
})

it("parses slash-ending urls", async () => {
  var md = fs.readFileSync(`${workingDir}/src/c4/test/c4-slash-ending-url.md`).toString() as string;
  let parsed = findModules("repo", md.split("\n"), 0)
  expect(parsed.modules[18].url?.slice(-3)).toBe("sol")
  expect(parsed.modules[18].name).toBe("OracleConvert.sol")
}) */
/*
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
}) */ 
//# sourceMappingURL=c4ContestParser.test.js.map