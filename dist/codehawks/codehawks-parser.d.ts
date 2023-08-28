import { Result, ContestWithModules, Repo } from "ah-shared";
export declare const parseActiveCodeHawksContests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const getPossiblyActiveContests: () => Promise<Repo[]>;
export declare const parseReposJobs: (contests: Repo[], existingContests: ContestWithModules[]) => Promise<(ContestWithModules | undefined)[]>;
export declare const parseContest: (name: string, url: string, readme: string) => Promise<Result<ContestWithModules>>;
