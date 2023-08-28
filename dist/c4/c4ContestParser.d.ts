import { C4Contest } from "../types";
import { ContestWithModules } from "ah-shared";
import { Result } from "ah-shared";
export declare let secondsPerLoc: number;
export declare const parseC4Contests: (contests: C4Contest[], existingContests: ContestWithModules[]) => Promise<ContestWithModules | undefined>[];
export declare const getActiveC4Contests: () => Promise<C4Contest[]>;
export declare const parseC4Contest: (contest: C4Contest) => Promise<Result<ContestWithModules>>;
