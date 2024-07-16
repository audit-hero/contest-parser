import { Contest } from "ah-shared";
import { E, O } from "ti-fptsu/lib";
export type Bullets = Pick<Contest, "prize" | "start_date" | "end_date" | "readme">;
export declare let parseBulletsActive: (md: string) => E.Either<Error, Bullets>;
export declare let getTimeFromBullets: (bullets: string[], prefix: string) => O.Option<number>;
export declare let getHeaderBullets: (md: string) => string[];
export declare let usdCoins: string[];
export declare let trimContestAmount: (amount: string) => string;
