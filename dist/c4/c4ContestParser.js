import { Logger } from "jst-logger";
import { findTags, getHtmlAsMd, trimContestName } from "../util.js";
import { sentryError } from "ah-shared";
import { convertToResult } from "./parse-utils.js";
import { getActiveC4Contests } from "./getActiveC4Contests.js";
import { pipe } from "fp-ts/lib/function.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { parseBulletsActive } from "./parse-header-bullets-active.js";
import * as O from "fp-ts/lib/Option.js";
import { NO_START_END, NO_REPO_FOUND } from "../errors.js";
import { parseBulletsUpcoming } from "./parse-header-bullets-upcoming.js";
import { findModules } from "./c4ModulesParser.js";
export const parseActiveC4Contests = async (existingContests) => {
    let res = await pipe(() => getActiveC4Contests(), 
    // TE.map(it => it.filter(it => it.slug.includes("wildcat"))),
    TE.chain((it) => TE.tryCatch(() => Promise.all(parseC4Contests(it, existingContests)), E.toError)), TE.map((it) => it.filter((it) => it !== undefined)), TE.mapLeft((it) => {
        sentryError("error parsing c4 contests", it);
        return it;
    }), TE.toUnion)();
    return res instanceof Error ? [] : res;
};
export const parseC4Contests = (contests, existingContests) => {
    let jobs = [];
    for (let i = 0; i < contests.length; ++i) {
        let contest = parseC4Contest(contests[i])
            .then((it) => {
            if (!it.ok) {
                if (it.error.message !== NO_START_END && it.error.message !== NO_REPO_FOUND)
                    sentryError(it.error, `failed to parse c4 contest ${contests[i].slug}`);
            }
            else
                return it.value;
        })
            .catch((err) => {
            sentryError(err, `error parsing c4 contest ${contests[i].slug}`);
            return undefined;
        });
        jobs.push(contest);
    }
    return jobs;
};
export const parseC4Contest = async (contest) => await pipe(() => Logger.info(`start parsing ${contest.slug}`), () => parseC4ContestEither(contest), convertToResult(contest))();
let parseC4ContestEither = (contest) => pipe(TE.tryCatch(() => getHtmlAsMd(`https://code4rena.com/audits/${contest.slug}`), E.toError), TE.chain((fullPageMd) => pipe(E.Do, E.bind("githubMd", () => E.right(trimPageToMd(fullPageMd))), E.bind("repo", () => getRepo(fullPageMd, contest.trimmedSlug)), E.chain(({ githubMd, repo }) => parseMd(contest, repo, githubMd)), TE.fromEither)));
let trimPageToMd = (md) => {
    let end = "* An open organization\n* [";
    let startIndex = md.match(/^#.*[Aa]udit [Dd]etails(?!.*not available)/m)?.index ?? md.match(/^#{1,3} [Ll]ogin/m)?.index ?? 0;
    let endIndex = md.indexOf(end);
    let trimmed = md.slice(startIndex, endIndex);
    return trimmed;
};
export const parseMd = (contest, 
// undefined for upcoming contests
repo, 
// starting from "audit details"
contestMd) => pipe(E.Do, E.apS("bulletPoints", pipe(parseBulletsActive(contestMd), E.orElse(() => parseBulletsUpcoming(contestMd)))), E.chain(({ bulletPoints }) => {
    let { prize, start_date, end_date, readme } = bulletPoints;
    let repo_urls = repo ? [repo] : [];
    let tags = [];
    let modules = [];
    let docUrls = [];
    let lines = contestMd.split("\n");
    if (repo) {
        let modulesResult = findModules(repo, lines, 0);
        modules = modulesResult.modules;
        docUrls = modulesResult.docUrls;
    }
    tags = findTags(lines);
    let status = "active";
    if (Math.floor(Date.now() / 1000) < start_date) {
        status = "created";
        contestMd = readme;
    }
    return E.of({
        pk: trimContestName(contest.trimmedSlug, start_date),
        sk: "0",
        url: `https://code4rena.com/audits/${contest.slug}`,
        readme: contestMd ?? "",
        start_date,
        end_date,
        platform: "c4",
        active: 1,
        status: status,
        prize,
        loc: modules.map((it) => it.loc ?? 0).reduce((sum, it) => sum + it, 0),
        modules: modules,
        doc_urls: docUrls,
        repo_urls,
        tags: tags,
    });
}));
let getRepo = (md, trimmedSlug) => {
    // [![edit](/icon/GitHub/16.svg)View Repo](https://github.com/code-423n4/2024-06-size) [Submit finding](/audits/2024-06-size/submit)
    return pipe(O.fromNullable(md.match(/View Repo\]\((.*?)\)/)), O.chain((it) => O.fromNullable(it.at(1))), E.fromOption(() => {
        Logger.debug(`no repo found in readme for ${trimmedSlug}`);
        return new Error(NO_REPO_FOUND);
    }), E.orElse(() => E.of(undefined)));
};
//# sourceMappingURL=c4ContestParser.js.map