import { trimContestName } from "../util.js"

export let isActive = (contest: ImmunefiContest) => {
  return (
    new Date(contest.launchDate) < new Date() &&
    new Date(contest.endDate) > new Date()
  )
}

export let toId = (contest: ImmunefiContest) => {
  return trimContestName(
    contest.id,
    new Date(contest.launchDate).getTime() / 1000
  )
}

export interface ImmunefiContest {
  contentfulId: string
  id: string
  project: string
  maximum_reward: number
  logo: string
  date: string
  launchDate: string
  endDate: string
  updatedDate: string
  technologies: string[]
  immunefiStandard: boolean
  tags: Tags
  evaluationEndDate: string
  boostedIntroStartingIn: string
  boostedIntroLive: string
  boostedIntroEvaluating: string
  boostedIntroFinished: string
  rewardsToken: string
  rewardsPool: number
  sourceLinesOfCode: number
  boostedSummaryReport: any
  inviteOnly: boolean
  hideAssetsInScope: any
  boostedLeaderboard: any
  features: string[]
  performanceMetrics: PerformanceMetrics
  vaultBalance: number
  premiumTriaging: boolean
}

export interface Tags {
  productType: string[]
  projectType: string[]
  ecosystem: string[]
  programType: string[]
  language: string[]
  general: string[]
}

export interface PerformanceMetrics {
  totalPaidMetricEnabled: boolean
  responseTimeMetricEnabled: boolean
  medianResponseTimeInMinutes: any
  totalPaidAmount: any
}
