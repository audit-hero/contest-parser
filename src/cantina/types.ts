
export type MdContest = {
  name: string;
  id: string;
  start_date: number;
  end_date: number;
  prize: string;
  status: MdStatus;
};

export type MdStatus = "live" |
  "upcoming" |
  "judging" |
  "escalations" |
  "ended" |
  "completed" |
  "unknown";
export let statuses = [
  "live",
  "upcoming",
  "judging",
  "escalations",
  "ended",
  "completed",
] as MdStatus[];
