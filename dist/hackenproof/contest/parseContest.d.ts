import { ContestWithModules } from "ah-shared";
import { HackenproofContest } from "../list/parseNuxt.js";
export declare const parseContest: (contest: HackenproofContest) => Promise<ContestWithModules>;
export declare const convertContest: (contest: HackenproofContest) => ContestWithModules;
