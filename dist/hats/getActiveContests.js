export const getActiveContests = async () => {
    let allProjects = await getAllProjects();
    let projectJobs = allProjects.map((it) => {
        return getProject(it.descriptionHash, it.id);
    });
    let rawProjects = await Promise.all(projectJobs);
    let activeProjects = filterProjectActiveOrInFuture(rawProjects);
    return activeProjects;
};
export const getAllProjects = async () => {
    let job1 = fetch("https://api.thegraph.com/subgraphs/name/hats-finance/hats", {
        method: "POST",
        body: '{"query":"\\n  query getVaults($account: String) {\\n    masters(first: 1000) {\\n      address\\n      governance\\n      numberOfSubmittedClaims\\n      withdrawPeriod\\n      safetyPeriod\\n      withdrawRequestEnablePeriod\\n      withdrawRequestPendingPeriod\\n      vestingHatDuration\\n      vestingHatPeriods\\n      defaultHackerHatRewardSplit\\n      defaultGovernanceHatRewardSplit\\n    }\\n    userNfts: nftowners(where: { address: $account }) {\\n      id\\n      balance\\n      nft {\\n        id\\n        tokenURI\\n        tokenId\\n        nftMaster\\n      }\\n    }\\n    vaults(first: 1000) {\\n      id\\n      version\\n      descriptionHash\\n      pid\\n      name\\n      stakingToken\\n      stakingTokenDecimals\\n      stakingTokenSymbol\\n      honeyPotBalance\\n      totalRewardPaid\\n      committee\\n      allocPoints\\n      master {\\n        address\\n        numberOfSubmittedClaims\\n        withdrawPeriod\\n        safetyPeriod\\n        withdrawRequestEnablePeriod\\n        withdrawRequestPendingPeriod\\n        vestingHatDuration\\n        vestingHatPeriods\\n        defaultHackerHatRewardSplit\\n        defaultGovernanceHatRewardSplit\\n        timelock: governance\\n      }\\n      numberOfApprovedClaims\\n      rewardsLevels\\n      liquidityPool\\n      registered\\n      maxBounty\\n      userWithdrawRequest: withdrawRequests( where: { beneficiary: $account }) {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      withdrawRequests {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      totalUsersShares\\n      descriptionHash\\n      hackerVestedRewardSplit\\n      hackerRewardSplit\\n      committeeRewardSplit\\n      swapAndBurnSplit\\n      governanceHatRewardSplit\\n      hackerHatRewardSplit\\n      vestingDuration\\n      vestingPeriods\\n      depositPause\\n      committeeCheckedIn\\n      rewardControllers {\\n        id\\n        rewardToken\\n        rewardTokenSymbol\\n        rewardTokenDecimals\\n        totalRewardPaid\\n      }\\n      activeClaim {\\n        id\\n        claim\\n      }\\n    }\\n    payouts: claims(first: 1000) {\\n      id\\n      vault {\\n        id\\n      }\\n      payoutDataHash: claim\\n      beneficiary: claimer\\n      approvedAt\\n      dismissedAt\\n      bountyPercentage\\n      severityIndex: severity\\n      hackerReward\\n      hackerVestedReward\\n      governanceHatReward\\n      hackerHatReward\\n      committeeReward\\n      isChallenged\\n    }\\n  }\\n","variables":{}}',
    }).then(async (it) => await it.json());
    let job2 = fetch("https://api.thegraph.com/subgraphs/name/hats-finance/hats_arbitrum", {
        headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/json",
            "sec-ch-ua": '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1",
        },
        referrer: "https://app.hats.finance/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: '{"query":"\\n  query getVaults($account: String) {\\n    masters(first: 1000) {\\n      address\\n      governance\\n      numberOfSubmittedClaims\\n      withdrawPeriod\\n      safetyPeriod\\n      withdrawRequestEnablePeriod\\n      withdrawRequestPendingPeriod\\n      vestingHatDuration\\n      vestingHatPeriods\\n      defaultHackerHatRewardSplit\\n      defaultGovernanceHatRewardSplit\\n    }\\n    userNfts: nftowners(where: { address: $account }) {\\n      id\\n      balance\\n      nft {\\n        id\\n        tokenURI\\n        tokenId\\n        nftMaster\\n      }\\n    }\\n    vaults(first: 1000) {\\n      id\\n      version\\n      descriptionHash\\n      pid\\n      name\\n      stakingToken\\n      stakingTokenDecimals\\n      stakingTokenSymbol\\n      honeyPotBalance\\n      totalRewardPaid\\n      committee\\n      allocPoints\\n      master {\\n        address\\n        numberOfSubmittedClaims\\n        withdrawPeriod\\n        safetyPeriod\\n        withdrawRequestEnablePeriod\\n        withdrawRequestPendingPeriod\\n        vestingHatDuration\\n        vestingHatPeriods\\n        defaultHackerHatRewardSplit\\n        defaultGovernanceHatRewardSplit\\n        timelock: governance\\n      }\\n      numberOfApprovedClaims\\n      rewardsLevels\\n      liquidityPool\\n      registered\\n      maxBounty\\n      userWithdrawRequest: withdrawRequests( where: { beneficiary: $account }) {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      withdrawRequests {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      totalUsersShares\\n      descriptionHash\\n      hackerVestedRewardSplit\\n      hackerRewardSplit\\n      committeeRewardSplit\\n      swapAndBurnSplit\\n      governanceHatRewardSplit\\n      hackerHatRewardSplit\\n      vestingDuration\\n      vestingPeriods\\n      depositPause\\n      committeeCheckedIn\\n      rewardControllers {\\n        id\\n        rewardToken\\n        rewardTokenSymbol\\n        rewardTokenDecimals\\n        totalRewardPaid\\n      }\\n      activeClaim {\\n        id\\n        claim\\n      }\\n    }\\n    payouts: claims(first: 1000) {\\n      id\\n      vault {\\n        id\\n      }\\n      payoutDataHash: claim\\n      beneficiary: claimer\\n      approvedAt\\n      dismissedAt\\n      bountyPercentage\\n      severityIndex: severity\\n      hackerReward\\n      hackerVestedReward\\n      governanceHatReward\\n      hackerHatReward\\n      committeeReward\\n      isChallenged\\n    }\\n  }\\n","variables":{}}',
        method: "POST",
        mode: "cors",
        credentials: "omit",
    }).then(async (it) => await it.json());
    let [projects, arbProjects] = await Promise.all([job1, job2]);
    return [...projects.data.vaults, ...arbProjects.data?.vaults ?? []];
};
export const filterProjectActiveOrInFuture = (projets) => {
    return projets.filter((it) => {
        if (it === undefined || it["project-metadata"] === undefined)
            return false;
        let startTime = it["project-metadata"].starttime;
        let endTime = it["project-metadata"].endtime;
        let type = it["project-metadata"].type;
        let privateContest = (it["project-metadata"].whitelist ?? []).length > 0;
        let active = startTime < Date.now() / 1000 && endTime > Date.now() / 1000;
        let inFuture = startTime > Date.now() / 1000;
        let isAudit = type === "audit";
        return (active || inFuture) && isAudit && !privateContest;
    });
};
export const getProject = async (descriptionHash, id) => {
    let project = await fetch(`https://ipfs2.hats.finance/ipfs/${descriptionHash}`).then(async (it) => {
        if (!it.ok)
            return undefined;
        return await it.json();
    });
    return { ...project, id: id };
};
//# sourceMappingURL=getActiveContests.js.map