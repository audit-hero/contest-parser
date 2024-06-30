export type CantinaStatus = "live" | "judging" | "complete" | "escalations" | "escalations_ended" | string;
export declare let statuses: string[];
export interface CantinaContest {
    id: string;
    name: string;
    company: Company;
    readmePath: string;
    gitRepoUrl: string;
    commitHash: string;
    timeframe: Timeframe;
    kind: "public_contet" | string;
    status: CantinaStatus;
    currencyCode: "USDC" | string;
    totalRewardPot: string;
    instructions: string;
    allowedSeverities: string[];
    consideredSeverities: string[];
    allowedLabels: AllowedLabel[];
    totalFindings: number;
    createdAt: string;
    createdBy: string;
}
export interface Company {
    id: string;
    name: string;
    logo: string;
    website: any;
    github: any;
    twitter: any;
}
export interface Timeframe {
    start: string;
    end: string;
}
export interface AllowedLabel {
    id: string;
    name: string;
    description: string;
    color: string;
    isSystem: boolean;
    reviewerRead: boolean;
    reviewerUse: boolean;
}
