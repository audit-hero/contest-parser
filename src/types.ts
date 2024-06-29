export interface C4Contest {
  slug: string;
  trimmedSlug: string;
}

export type SherlockContest = Record<string, any> & {
  ends_at: number,
  id: number,
  logo_url: string,
  prize_pool: number,
  short_description: string
  description?: string // not included in the list or in a private contest
  starts_at: number,
  template_repo_name: string,
  status: "FINISHED" | "CREATED" | "RUNNING" | "JUDGING" | "SHERLOCK_JUDGING" | "ESCALATING"
  title: string
  calc_completed: boolean
}