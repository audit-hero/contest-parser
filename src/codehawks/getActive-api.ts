export type HawksApiContest = {
  id: string
  description: string
  company: string
  name: string
  protocolTags: null
  urlSlug: string
  logoImgPublicId: string
  reward: number
  rewardHighMedium: number
  rewardLow: number
  rewardCommunityJudging: number
  xpBoost: number
  maxRewardedCommunityJudgingPosition: number
  currency: string
  githubUrl: string
  startDate: string
  endDate: string
  appealStartDate?: string
  appealEndDate?: string
  communityJudgingEnabled: boolean
  communityJudgingStartDate: Date
  communityJudgingEndDate: null
  leadJudgeId: null
  firstFlight: boolean
  formalVerification: boolean
  kycRewards: boolean
  privateSubmissionsToggle: boolean
  privateSubmissionsPublicAfterFinalisationToggle: boolean
  finalised: boolean
  cjEligibilityContestParticipation: boolean
  cjEligibilityPreviousValidSubmission: boolean
  cjEligibilityPreviousMonetaryReward: boolean
  cjEligibilityValidSubmissionsRatio: boolean
  nsloc: number
}

export const getAllContests = async (): Promise<HawksApiContest[]> => {
  let md = await getContests()
  return md
}

export const getActiveContests = async () => {
  let allContests = await getAllContests()

  let epochSeconds = Math.floor(Date.now() / 1000)

  return allContests.filter((it) => {
    return new Date(it.endDate).getTime() / 1000 >= epochSeconds
  })
}

let getContests = async () => {
  let res = fetch(
    "https://codehawks.cyfrin.io/trpc/competitions.getCompetitions?batch=1&input=%7B%7D",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        cookie:
          "__Host-authjs.csrf-token=717c284b1e069d9175dfcef9da64da85cfa293b697b26507ce22788691aee0fe%7C0b1beb834e8dfe0eb4551a8bbedb15fce64405dcb722a245174d4aef520994f8; __Secure-authjs.callback-url=https%3A%2F%2Fcodehawks.cyfrin.io",
        Referer:
          "https://codehawks.cyfrin.io/contests?community-judging=true&contestType=all&ended=true&judging=true&live=true&sort=endDate&upcoming=true",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    },
  )
    .then((it) => it.json())
    .then((it) => it[0].result.data as HawksApiContest[])

  return res
}
