import { Project } from "./types";
import { ContestWithModules } from "ah-shared";
export declare const parseActiveHatsContests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const parseContests: (contests: Project[], existingContests: ContestWithModules[]) => Promise<(ContestWithModules | undefined)[]>;
export declare const getDatesError: (startDate: number, endDate: number, name: string) => {
    error: string;
} | undefined;
