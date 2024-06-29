import { ContestModule, ContestWithModules, Result } from "ah-shared";
import { C4Contest } from "../types.js";
import { TE } from "ti-fptsu/lib";
export declare const getHmAwards: (bulletPoints: string[]) => string;
export declare const findModules: (repo: string, lines: string[], moduleFindWay: number) => {
    modules: ContestModule[];
    docUrls: string[];
};
export declare const getTimestamp: (date: string) => number;
export declare let truncateLongNames: (contests: C4Contest[]) => C4Contest[];
export declare let convertToResult: (contest: C4Contest) => (res: TE.TaskEither<Error, ContestWithModules>) => import("fp-ts/lib/Task.js").Task<Result<ContestWithModules>>;
