import { ContestWithModules, Result } from "ah-shared";
import { TE } from "ti-fptsu/lib";
import { C4Contest } from "../types.js";
export declare const getHmAwards: (bulletPoints: string[]) => string;
export declare let convertToResult: (contest: C4Contest) => (res: TE.TaskEither<Error, ContestWithModules>) => import("fp-ts/lib/Task.js").Task<Result<ContestWithModules>>;
