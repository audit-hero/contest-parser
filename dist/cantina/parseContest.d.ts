import { ContestWithModules } from "ah-shared";
import { MdContest } from "./getActive.js";
export declare const parseContest: (contest: MdContest) => Promise<ContestWithModules>;
export declare const parseMd: (mdContest: MdContest, md: string) => ContestWithModules;
