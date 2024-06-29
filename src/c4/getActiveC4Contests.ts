import { truncateLongNames } from "./parse-utils.js"
import { C4Contest } from "../types.js"
import * as O from "fp-ts/lib/Option.js"
import { pipe } from "fp-ts/lib/function.js"
import * as E from "fp-ts/lib/Either.js"
import { getHtmlAsMd } from "../util.js"

export const getActiveC4Contests = async () => {
  let md = await getHtmlAsMd("https://code4rena.com/audits#active-audits")

  let contests = pipe(
    parseMd(md),
    E.map((it) => truncateLongNames(it))
  )

  return contests
}

let parseMd = (md: string): E.Either<Error, C4Contest[]> =>
  pipe(
    E.Do,
    E.bind("start", () =>
      pipe(
        O.fromNullable(md.match(/^#{1,3} .*(A|a)ctive/m)?.index),
        E.fromOption(() => "no active contests found")
      )
    ),
    E.bind("end", ({ start }) =>
      pipe(
        O.fromNullable(md.slice(start).match(/^#{1,3}/m)?.[0].length),
        E.fromOption(() => "no end found"),
        E.map(
          (hashCount) =>
            start + md.slice(start).indexOf(`\n${"#".repeat(hashCount)} `, 1)
        )
      )
    ),
    E.map(({ start, end }) => parseActive(md, { start, end })),
    E.mapLeft((it) => new Error(it))
  )

// prettier-ignore
let parseActive = (
  md: string,
  { start, end }: { start: number; end: number }
): C4Contest[] =>
  pipe(
    (() => {
      // remove the main heading
      let contestsParagraph = md.slice(start, end).split("\n").slice(1).join("\n")
      let lowestHash = findLowestHashCount(contestsParagraph)
      // remove info before contests
      if (!contestsParagraph.trim().startsWith("#")) {
        contestsParagraph = contestsParagraph
        .split(`${"#".repeat(lowestHash)}`).slice(1)
        .join(`${"#".repeat(lowestHash)}`)
      }

      return { lowestHash, contestsParagraph }
    })(),
    ({ lowestHash, contestsParagraph }) =>
      splitContests(contestsParagraph, lowestHash)
      .map(parseSingleContest)
  )

let findLowestHashCount = (md: string) => {
  let hashCounts = md.match(/^#{1,3}/gm)?.map((it) => it.length) ?? []
  return Math.min(...hashCounts)
}

let splitContests = (md: string, hashCount: number) =>
  md.split(`${"#".repeat(hashCount)}`)

let parseSingleContest = (md: string): C4Contest => {
  // [View audit](/audits/2024-06-ebtc-zap-router#top)
  let linkIndex = md.match(/^\[.*\]\(\/audits\//g)?.index
  let slug = md
    .slice(linkIndex)
    .split("\n")[0]
    .split("audits/")[1]
    .split("#")[0]

  return {
    slug: slug,
    trimmedSlug: slug,
    repo: `https://github.com/code-423n4/${slug}`,
  }
}
