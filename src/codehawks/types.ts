export type HawksMdContest = {
  name: string
  id: string
  start_date: number
  end_date: number
  prize: string
  status: MdStatus
}

export type MdStatus =
  | "live"
  | "appeal review"
  | "appeals review"
  | "appeal period"
  | "appeals period"
  | "judging period"
  | "completed"
  | "unknown"

export let statuses = [
  "live",
  "appeal review",
  "appeals review",
  "appeal period",
  "appeals period",
  "judging period",
  "completed",
] as MdStatus[]
