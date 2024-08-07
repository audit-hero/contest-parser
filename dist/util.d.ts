export declare let moduleExtensions: string[];
export declare let docHeadings: string[];
export declare let ignoredScopeFiles: string[];
export declare let isIgnoredContestName: (name: string) => boolean;
export declare const getContestStatus: (dates: {
    startDate: number;
    endDate: number;
}) => Status;
export declare let trimContestName: (name: string, startDate: number) => string;
export declare let addYearAndMonthToContestName: (startDate: number) => (name: string) => string;
export declare let replaceNonTextCharacters: (contestName: string) => string;
export declare const getMdHeading: (line: string, headings: string[]) => string | undefined;
export declare const findDocUrl: (line: string, headings: string[]) => string[];
export declare const findTags: (lines: string[]) => string[];
export declare let githubUrlToRawUrl: (url: string) => string;
export declare const getReadmeFromGithub: (user: string, repo: string) => Promise<{
    readme: string;
    baseUrl: string;
} | undefined>;
export declare const getAllRepos: (org: string) => Promise<Repo[]>;
export declare const getRepoNameFromUrl: (url: string) => string;
import { Status } from "ah-shared";
import { Repo } from "ah-shared";
export declare let workingDir: () => string;
export declare const logTrace: (msg: () => string) => void;
export declare let truncateLongContestName: (name: string) => string;
export declare const getAnyDateUTCTimestamp: (someStringDate: string) => number;
export declare const getJsDateTimestamp: (someStringDate: string) => number;
export declare let getHtmlAsMd: (url: string) => Promise<string>;
