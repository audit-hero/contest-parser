import { ContestWithModules } from "ah-shared";
import { MdContest } from "./types.js";
export declare const parseActiveImmunefiContests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const getAllContests: () => Promise<MdContest[]>;
export declare const getActiveContests: () => Promise<MdContest[]>;
