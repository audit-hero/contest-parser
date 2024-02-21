export type MdContest = {
  name: string
  id: string
  // start_date: number
  // end_date: number
  prize: string
  status: MdStatus
}

export let statuses = ["live", "starting in", "finished"] as MdStatus[]

export type MdStatus = "live" | "starting in" | "finished" | "unknown"

export let isActive = (status:MdStatus) => {
  return status === "live" || status === "starting in"
}
