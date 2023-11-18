export declare const getActive: () => Promise<MdContest[]>;
export type MdContest = {
    name: string;
    id: string;
    start_date: number;
    end_date: number;
    prize: string;
};
export declare const getContestUrls: (loadingPhrases?: string[]) => Promise<string[]>;
export declare const getActiveContests: (md: string) => MdContest[];
