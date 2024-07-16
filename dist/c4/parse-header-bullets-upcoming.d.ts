import { E } from "ti-fptsu/lib";
export declare let parseBulletsUpcoming: (md: string) => E.Either<Error, {
    start: number;
    end: number;
    hmAwards: string;
}>;
export declare let usdCoins: string[];
export declare let trimContestAmount: (amount: string) => string;
