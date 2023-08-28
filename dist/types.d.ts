export interface C4Contest {
    uid: string;
    contest_id: number;
    title: string;
    sponsor: string;
    details: string;
    start_time: string;
    end_time: string;
    award_coin: string;
    formatted_amount: string;
    total_award_pool: number;
    hm_award_pool: number;
    qa_award_pool: number;
    gas_award_pool?: null;
    repo: string;
    findings_repo: string;
    hide: boolean;
    league: string;
    audit_type: string;
    code_access?: null;
    status: string;
    amount: string;
    codeAccess?: null;
    contestid: number;
    findingsRepo: string;
    type: string;
    sponsor_data: SponsorData;
    slug: string;
    trimmedSlug: string;
}
export interface SponsorData {
    uid: string;
    name: string;
    link: string;
    image: string;
    created_at: string;
    updated_at: string;
    imageUrl: string;
}
export type SherlockContest = Record<string, any> & {
    ends_at: number;
    id: number;
    logo_url: string;
    prize_pool: number;
    short_description: string;
    description?: string;
    starts_at: number;
    template_repo_name: string;
    status: "FINISHED" | "CREATED" | "RUNNING" | "JUDGING" | "SHERLOCK_JUDGING";
    title: string;
    calc_completed: boolean;
};
