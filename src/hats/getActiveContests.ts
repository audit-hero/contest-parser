import { isIgnoredContestName } from "../util.js"
import { Project, VaultElement } from "./types.js"
export let hats_urls = [
  "https://gateway-arbitrum.network.thegraph.com/api/0ed4473ee53352068095380ea517339c/subgraphs/id/2cbCwzhBbKkdpXtuNYkG5ch5dJDNAnTmeRhePDpkR4JV",
  // sepolia
  // "https://gateway-arbitrum.network.thegraph.com/api/0ed4473ee53352068095380ea517339c/subgraphs/id/6q8vE8znoVRd2AqdGcgaF7j99Gtrrki4HwYDVMK8qaCf",
  "https://gateway-arbitrum.network.thegraph.com/api/0ed4473ee53352068095380ea517339c/subgraphs/id/vMkoKYXdwa5dww7FD6ra9EdLgA2E3hmz2Q3BxF8DEAW",
  "https://gateway-arbitrum.network.thegraph.com/api/0ed4473ee53352068095380ea517339c/subgraphs/id/GXUgxLXF1Ad2dmmxF5J24JUGKj6ko22t6esPkdLhKAz4",
  "https://gateway-arbitrum.network.thegraph.com/api/0ed4473ee53352068095380ea517339c/subgraphs/id/GH7Cv6XKuWYTMUrXcAfcqRmJRERPxFThyHtz1AeNCZQa",
  "https://gateway-arbitrum.network.thegraph.com/api/0ed4473ee53352068095380ea517339c/subgraphs/id/HPwWDxud8fSarSK8XfwSxcTkyKMQf7RwFmS7kPmTX9dD",
  "https://gateway-arbitrum.network.thegraph.com/api/0ed4473ee53352068095380ea517339c/subgraphs/id/4TWs2Y9gCpUPh1vMSogFuRbBqsUzE4FXgYFAoJmcx9Fc",
  "https://api.goldsky.com/api/public/project_clx0j1z1v44iz01wb4qol83tv/subgraphs/hats_oasis/0.0.1/gn",
]

export const getActiveContests = async (): Promise<Project[]> => {
  let allProjects = await getAllProjects()

  let projectJobs = allProjects.map((it) => {
    return getProject(it.descriptionHash, it.id)
  })

  let rawProjects = await Promise.all(projectJobs)

  let activeProjects = filterProjectActiveOrInFuture(rawProjects)
  return activeProjects
}

export const getAllProjects = async () => {
  // different chains have different urls. get new ones from https://app.hats.finance/audit-competitions : main.js

  let getJob = (url: string) =>
    fetch(url, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-gpc": "1",
      },
      referrer: "https://app.hats.finance/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: '{"query":"\\n  query getVaults($account: String) {\\n    masters(first: 1000) {\\n      address\\n      governance\\n      numberOfSubmittedClaims\\n      withdrawPeriod\\n      safetyPeriod\\n      withdrawRequestEnablePeriod\\n      withdrawRequestPendingPeriod\\n      vestingHatDuration\\n      vestingHatPeriods\\n      defaultHackerHatRewardSplit\\n      defaultGovernanceHatRewardSplit\\n    }\\n    userNfts: nftowners(where: { address: $account }) {\\n      id\\n      balance\\n      nft {\\n        id\\n        tokenURI\\n        tokenId\\n        nftMaster\\n      }\\n    }\\n    vaults(first: 1000) {\\n      id\\n      version\\n      descriptionHash\\n      pid\\n      name\\n      stakingToken\\n      stakingTokenDecimals\\n      stakingTokenSymbol\\n      honeyPotBalance\\n      totalRewardPaid\\n      committee\\n      allocPoints\\n      stakers {\\n        address\\n        totalRewardPaid\\n        shares\\n      }\\n      master {\\n        address\\n        numberOfSubmittedClaims\\n        withdrawPeriod\\n        safetyPeriod\\n        withdrawRequestEnablePeriod\\n        withdrawRequestPendingPeriod\\n        vestingHatDuration\\n        vestingHatPeriods\\n        defaultHackerHatRewardSplit\\n        defaultGovernanceHatRewardSplit\\n        timelock: governance\\n      }\\n      numberOfApprovedClaims\\n      rewardsLevels\\n      liquidityPool\\n      registered\\n      maxBounty\\n      userWithdrawRequest: withdrawRequests( where: { beneficiary: $account }) {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      withdrawRequests {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      totalUsersShares\\n      descriptionHash\\n      hackerVestedRewardSplit\\n      hackerRewardSplit\\n      committeeRewardSplit\\n      swapAndBurnSplit\\n      governanceHatRewardSplit\\n      hackerHatRewardSplit\\n      vestingDuration\\n      vestingPeriods\\n      depositPause\\n      committeeCheckedIn\\n      claimsManager\\n      destroyed\\n      rewardControllers {\\n        id\\n        rewardToken\\n        rewardTokenSymbol\\n        rewardTokenDecimals\\n        totalRewardPaid\\n        startBlock\\n        epochLength\\n        epochRewardPerBlock\\n        totalAllocPoint\\n      }\\n      activeClaim {\\n        id\\n        claim\\n      }\\n    }\\n    payouts: claims(first: 1000) {\\n      id\\n      vault {\\n        id\\n      }\\n      payoutDataHash: claim\\n      beneficiary: claimer\\n      approvedAt\\n      dismissedAt\\n      bountyPercentage\\n      severityIndex: severity\\n      hackerReward\\n      hackerVestedReward\\n      governanceHatReward\\n      hackerHatReward\\n      committeeReward\\n      isChallenged\\n    }\\n  }\\n","variables":{"account":"0x398603fE88496B3f48Ec863DD112466e974202ae"}}',
      method: "POST",
      mode: "cors",
      credentials: "omit",
    }).then(async (it) => await it.json())

  let projects = await Promise.all(hats_urls.map(getJob))

  return projects.flatMap((it) => (it.data?.vaults as VaultElement[]) ?? [])
}

export const filterProjectActiveOrInFuture = (projets: Project[]) => {
  return projets.filter((it) => {
    if (it === undefined || it["project-metadata"] === undefined) return false
    if (isIgnoredContestName(it["project-metadata"].name)) return false

    let startTime = it["project-metadata"].starttime
    let endTime = it["project-metadata"].endtime
    let type = it["project-metadata"].type

    let privateContest = (it["project-metadata"].whitelist ?? []).length > 0

    let active = endTime > Date.now() / 1000
    let isAudit = type === "audit" || type === "normal"

    return active && isAudit && !privateContest
  })
}

export const getProject = async (descriptionHash: string, id: string) => {
  let project = await fetch(
    `https://ipfs2.hats.finance/ipfs/${descriptionHash}`
  ).then(async (it) => {
    if (!it.ok) return undefined
    return await it.json()
  })

  return { ...project, id: id } as Project
}
