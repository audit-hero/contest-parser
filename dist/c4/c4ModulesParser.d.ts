import { ContestModule } from "ah-shared";
import { C4Contest } from "../types.js";
export declare const findModules: (repo: string, lines: string[], moduleFindWay: number) => {
    modules: ContestModule[];
    docUrls: string[];
};
export declare const getTimestamp: (date: string) => number;
export declare let truncateLongNames: (contests: C4Contest[]) => C4Contest[];
