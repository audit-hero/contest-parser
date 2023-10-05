import { Result } from "ah-shared";
import { ContestWithModules } from "ah-shared";
import { SherlockContest } from "../types.js";
export declare const parseActiveSherlockContests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const parseSherlockContests: (contests: SherlockContest[], existingContests: ContestWithModules[]) => Promise<ContestWithModules | undefined>[];
export declare const getActiveSherlockContests: () => Promise<SherlockContest[]>;
export declare const parseSherlockContest: (contest: SherlockContest) => Promise<Result<ContestWithModules>>;
