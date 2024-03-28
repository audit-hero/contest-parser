import { C4Contest } from "../types.js";
import { ContestWithModules } from "ah-shared";
import { Result } from "ah-shared";
export declare const parseActiveC4Contests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const parseC4Contests: (contests: C4Contest[], existingContests: ContestWithModules[]) => Promise<ContestWithModules | undefined>[];
export declare const getActiveC4Contests: () => Promise<C4Contest[]>;
export declare const parseC4Contest: (contest: C4Contest) => Promise<Result<ContestWithModules>>;
export declare const parseMd: (url: string, readme: string | undefined, repo: string, contest: C4Contest) => Result<ContestWithModules>;
export declare let trimContestAmount: (amount: string) => string;
