import { ContestWithModules } from "ah-shared";
import { CantinaContest } from "../types.js";
export declare const parseContest: (contest: CantinaContest) => Promise<ContestWithModules>;
export declare const parseMd: (contest: CantinaContest, md: string) => ContestWithModules;
