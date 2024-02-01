import { ContestWithModules } from "ah-shared";
import { HawksMdContest } from "./types.js";
export declare const parseContest: (contest: HawksMdContest) => Promise<ContestWithModules>;
export declare const parseMd: (mdContest: HawksMdContest, md: string) => ContestWithModules;
