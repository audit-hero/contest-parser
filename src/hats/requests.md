

```
fetch("https://api.thegraph.com/subgraphs/name/hats-finance/hats", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Brave\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "sec-gpc": "1",
    "Referer": "https://app.hats.finance/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "{\"query\":\"\\n  query getVaults($account: String) {\\n    masters(first: 1000) {\\n      address\\n      governance\\n      numberOfSubmittedClaims\\n      withdrawPeriod\\n      safetyPeriod\\n      withdrawRequestEnablePeriod\\n      withdrawRequestPendingPeriod\\n      vestingHatDuration\\n      vestingHatPeriods\\n      defaultHackerHatRewardSplit\\n      defaultGovernanceHatRewardSplit\\n    }\\n    userNfts: nftowners(where: { address: $account }) {\\n      id\\n      balance\\n      nft {\\n        id\\n        tokenURI\\n        tokenId\\n        nftMaster\\n      }\\n    }\\n    vaults(first: 1000) {\\n      id\\n      version\\n      descriptionHash\\n      pid\\n      name\\n      stakingToken\\n      stakingTokenDecimals\\n      stakingTokenSymbol\\n      honeyPotBalance\\n      totalRewardPaid\\n      committee\\n      allocPoints\\n      master {\\n        address\\n        numberOfSubmittedClaims\\n        withdrawPeriod\\n        safetyPeriod\\n        withdrawRequestEnablePeriod\\n        withdrawRequestPendingPeriod\\n        vestingHatDuration\\n        vestingHatPeriods\\n        defaultHackerHatRewardSplit\\n        defaultGovernanceHatRewardSplit\\n        timelock: governance\\n      }\\n      numberOfApprovedClaims\\n      rewardsLevels\\n      liquidityPool\\n      registered\\n      maxBounty\\n      userWithdrawRequest: withdrawRequests( where: { beneficiary: $account }) {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      withdrawRequests {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      totalUsersShares\\n      descriptionHash\\n      hackerVestedRewardSplit\\n      hackerRewardSplit\\n      committeeRewardSplit\\n      swapAndBurnSplit\\n      governanceHatRewardSplit\\n      hackerHatRewardSplit\\n      vestingDuration\\n      vestingPeriods\\n      depositPause\\n      committeeCheckedIn\\n      rewardControllers {\\n        id\\n        rewardToken\\n        rewardTokenSymbol\\n        rewardTokenDecimals\\n        totalRewardPaid\\n      }\\n      activeClaim {\\n        id\\n        claim\\n      }\\n    }\\n    payouts: claims(first: 1000) {\\n      id\\n      vault {\\n        id\\n      }\\n      payoutDataHash: claim\\n      beneficiary: claimer\\n      approvedAt\\n      dismissedAt\\n      bountyPercentage\\n      severityIndex: severity\\n      hackerReward\\n      hackerVestedReward\\n      governanceHatReward\\n      hackerHatReward\\n      committeeReward\\n      isChallenged\\n    }\\n  }\\n\",\"variables\":{}}",
  "method": "POST"
});
```

```
QmdZ8eyN7QyTSnSQBTxbdBZsw3o3YoS9LgBAHoXeGDwLU3 descriptionHash

fetch("https://ipfs2.hats.finance/ipfs/QmdZ8eyN7QyTSnSQBTxbdBZsw3o3YoS9LgBAHoXeGDwLU3", {
    "headers": {
      "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Brave\";v=\"116\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "Referer": "https://app.hats.finance/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
```