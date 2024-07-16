import { ContestWithModules } from "ah-shared";
import { HawksApiContest } from "./getActive-api.js";
export declare const parseContest: (contest: HawksApiContest) => Promise<ContestWithModules>;
export declare const parseMd: (apiContest: HawksApiContest, md: string) => ContestWithModules;
