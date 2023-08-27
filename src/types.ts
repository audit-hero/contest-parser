export type Contest = {
  pk: string,
  sk: string,
  url: string,
  start_date: number,
  end_date: number,
  // = end_date > current_date (can be created but not running)
  active: number,
  status: Status
  prize: string, // could be eth or usd
  platform: Platform
  tags: Tag[]
  repo_urls?: string[];
  doc_urls?: string[];
  em_stored?: number
  analyze_result?: {
    total_nsloc: number
  }
}

export type Status = "created" | "active" | "judging" | "finished"

export type ContestEmbeddings = {
  pk: string,
  sk: string,
  emb_q: string,
  chat_q: string,
  k: number,
  emb_res: Document[],
  chat_res: string
}

export type ContestWithModules = Contest & {
  modules: ContestModule[]
  auditTime?: number
  loc?: number
}

// could be different contracts or combination of contracts. Also frontend/backend
export type ContestModule = {
  name: string
  contest: string
  active: number
  // approximate audit time in seconds
  auditTime?: number
  link_in_md?: string
  url?: string
  path?: string
  loc?: number
}

export const ALL_PLATFORMS = ["c4", "sherlock", "codehawks", "hats"]
export type PlatformTuple = typeof ALL_PLATFORMS
export type Platform = PlatformTuple[number]


export const ALL_TAGS = ["none", "712", "721", "1967", "1155", "4626", "erc20", "nft", "bridge", "proxy", "l2", "domain_separator", "division", "initializ", "slippage", " amm ", "lend", "borrow", "swap", "stable", "curve", "token", "ecrecover", "foundry", "reentrancy", "flash loan", "weth", "fee on transfer"]
export type TagTuple = typeof ALL_TAGS
export type Tag = TagTuple[number]

// C4

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
  trimmedSlug:string;
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
  ends_at: number,
  id: number,
  logo_url: string,
  prize_pool: number,
  short_description: string
  description?: string // not included in the list or in a private contest
  starts_at: number,
  template_repo_name: string,
  status: "FINISHED" | "CREATED" | "RUNNING" | "JUDGING" | "SHERLOCK_JUDGING"
  title: string
  calc_completed: boolean
}

export interface Repo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: string;
  description?: null;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage?: null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language?: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url?: null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license?: License | null;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics?: (null)[] | null;
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  permissions: Permissions;
}
export interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}
export interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
}
export interface Permissions {
  admin: boolean;
  maintain: boolean;
  push: boolean;
  triage: boolean;
  pull: boolean;
}
