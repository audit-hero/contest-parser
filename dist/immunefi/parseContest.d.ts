import { ContestWithModules } from "ah-shared";
import { ImmunefiContest } from "./types.js";
export declare const parseContest: (contest: ImmunefiContest) => Promise<ContestWithModules>;
export declare const parseMd: (mdContest: ImmunefiContest) => ContestWithModules;
