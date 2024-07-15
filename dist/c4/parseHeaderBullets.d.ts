import { E } from "ti-fptsu/lib";
export declare let parseHeaderBullets: (md: string) => E.Either<Error, {
    start: number;
    end: number;
    hmAwards: string;
}>;
export declare let trimContestAmount: (amount: string) => string;
