import { ContestWithModules } from "ah-shared";
import { ImmunefiContest } from "./types.js";
export declare const parseActiveImmunefiContests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const getAllContests: () => Promise<ImmunefiContest[]>;
export declare const getActiveContests: () => Promise<ImmunefiContest[]>;
