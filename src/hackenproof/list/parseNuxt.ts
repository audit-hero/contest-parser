import { trimContestName } from "../../util.js"

const requiredKeys = [
  "slug",
  "startDate",
  "endDate",
  "status",
  "reward",
  "name",
  "repoUrl",
  "isUnending",
  "description",
]

export type KeyPositions = {
  slug: number
  startDate: number
  endDate: number
  status: number
  reward: number
  name: number
  repoUrl: number
  isUnending: number
  description: number
}

export type HackenproofContestStatus = "LIVE" | "ENDED"
export type HackenproofContest = {
  slug: string
  startDate: string
  endDate: string
  status: HackenproofContestStatus
  reward: string
  name: string
  description: string
  repoUrl: string
  isUnending: boolean
}

export const parseNuxtData = (input: any[]): HackenproofContest[] => {
  const contests: HackenproofContest[] = []

  for (let i = 0; i < input.length; i++) {
    let value = input[i]
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const keyMap = value as Record<string, number>
      if (!requiredKeys.some((key) => key in keyMap)) continue

      let keys = Object.keys(keyMap)
      let values = Object.values(keyMap)
      const positions: KeyPositions = {} as KeyPositions
      for (let j = 0; j < keys.length; j++) {
        if (requiredKeys.includes(keys[j])) {
          positions[keys[j] as keyof KeyPositions] = values[j]
        }
      }

      // Create contest object using the positions to lookup values
      const contest: HackenproofContest = {
        slug: input[positions.slug] as string,
        startDate: input[positions.startDate] as string,
        endDate: input[positions.endDate] as string,
        status: input[positions.status] as HackenproofContestStatus,
        reward: input[positions.reward] as string,
        name: input[positions.name] as string,
        repoUrl: input[positions.repoUrl] as string,
        isUnending: input[positions.isUnending] as boolean,
        description: input[positions.description] as string,
      }

      contests.push(contest)
    }
  }

  return contests
}
