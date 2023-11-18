export declare const getActiveCantinaContests: () => Promise<MdContest[]>;
export type MdContest = {
    name: string;
    id: string;
    start_date: number;
    end_date: number;
    prize: string;
};
export declare const getActiveContests: (md: string) => MdContest[];
