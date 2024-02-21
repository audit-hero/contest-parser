export type MdContest = {
    name: string;
    id: string;
    prize: string;
    status: MdStatus;
};
export declare let statuses: MdStatus[];
export type MdStatus = "live" | "starting in" | "finished" | "unknown";
export declare let isActive: (status: MdStatus) => boolean;
