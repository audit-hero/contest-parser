import { C4Contest } from "../types.js";
import * as E from "fp-ts/lib/Either.js";
export declare const getActiveC4Contests: () => Promise<E.Either<Error, C4Contest[]>>;
