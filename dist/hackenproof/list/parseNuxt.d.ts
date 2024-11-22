export type KeyPositions = {
    slug: number;
    startDate: number;
    endDate: number;
    status: number;
    reward: number;
    name: number;
    repoUrl: number;
    isUnending: number;
    description: number;
};
export type HackenproofContestStatus = "LIVE" | "ENDED";
export type HackenproofContest = {
    slug: string;
    startDate: string;
    endDate: string;
    status: HackenproofContestStatus;
    reward: string;
    name: string;
    description: string;
    repoUrl: string;
    isUnending: boolean;
};
export declare const parseNuxtData: (input: any[]) => HackenproofContest[];
