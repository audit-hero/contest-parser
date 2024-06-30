export declare let isActive: (contest: ImmunefiContest) => boolean;
export declare let toId: (contest: ImmunefiContest) => string;
export interface ImmunefiContest {
    contentfulId: string;
    id: string;
    project: string;
    maximum_reward: number;
    logo: string;
    date: string;
    launchDate: string;
    endDate: string;
    updatedDate: string;
    technologies: string[];
    immunefiStandard: boolean;
    tags: Tags;
    evaluationEndDate: string;
    boostedIntroStartingIn: string;
    boostedIntroLive: string;
    boostedIntroEvaluating: string;
    boostedIntroFinished: string;
    rewardsToken: string;
    rewardsPool: number;
    sourceLinesOfCode: number;
    boostedSummaryReport: any;
    inviteOnly: boolean;
    hideAssetsInScope: any;
    boostedLeaderboard: any;
    features: string[];
    performanceMetrics: PerformanceMetrics;
    vaultBalance: number;
    premiumTriaging: boolean;
}
export interface Tags {
    productType: string[];
    projectType: string[];
    ecosystem: string[];
    programType: string[];
    language: string[];
    general: string[];
}
export interface PerformanceMetrics {
    totalPaidMetricEnabled: boolean;
    responseTimeMetricEnabled: boolean;
    medianResponseTimeInMinutes: any;
    totalPaidAmount: any;
}
