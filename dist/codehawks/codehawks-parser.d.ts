import { ContestModule, ContestWithModules, Repo } from "ah-shared";
import { Either } from "fp-ts/lib/Either";
export declare const parseActiveCodeHawksContests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const getPossiblyActiveContests: () => Promise<Repo[]>;
export declare const parseReposJobs: (contests: Repo[], existingContests: ContestWithModules[]) => Promise<(ContestWithModules | undefined)[]>;
export declare const parseContest: (name: string, url: string, readme: string) => Promise<Either<string, ContestWithModules>>;
export declare const getModulesV2: (inScopeParagraph: string[], contest: string, repo: string) => Either<string, ContestModule[]>;
export declare const getModuleFromFullPathLine: (line: string, contest: string, repo: string) => ContestModule | undefined;
