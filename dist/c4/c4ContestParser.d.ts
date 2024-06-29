import { C4Contest } from "../types.js";
import { ContestWithModules } from "ah-shared";
import { Result } from "ah-shared";
import * as E from "fp-ts/lib/Either.js";
export declare const parseActiveC4Contests: (existingContests: ContestWithModules[]) => Promise<ContestWithModules[]>;
export declare const parseC4Contests: (contests: C4Contest[], existingContests: ContestWithModules[]) => Promise<ContestWithModules | undefined>[];
export declare const parseC4Contest: (contest: C4Contest) => Promise<Result<ContestWithModules>>;
export declare const parseMd: (contest: C4Contest, repo: string, contestMd: string) => E.Either<Error, ContestWithModules>;
