"[Home](/) [Contests](/contests) [First Flights](/first-flights) [Leaderboard](/leaderboard) [Docs](https://docs.codehawks.com/) CONNECT WALLET

MENU

### MorpheusAI

live

# MorpheusAI

Morpheus AI is a Smart Agent concept of connecting LLMs and AI Agents to wallets, Dapps, & smart contracts promises to open the world of Web3 to everyone. Chatting in normal language with your Smart Agent and having it understand the question or task, is similar to how Google's search engine opened the early internet up to the general public.

Start Date Jan 30th, 2024 (12:00)

End Date Feb 3rd, 2024 (12:00)

Time Left 3d/1h/45m

Rewards $22,500 USDC

[view repo ](https://github.com/Cyfrin/2024-01-Morpheus) submit finding 

# Morpheus AI

![Morpheus](https://res.cloudinary.com/droqoz7lg/image/upload/q_90/dpr_2.0/c_fill,g_auto,h_320,w_320/f_auto/v1/company/lqgum0l8pxf8butrd13n?_a=BATAUVAA0) 

## Contest Details

* Total Prize Pool: $22,500  
   * HM Awards: 20,000  
   * Low Awards: 2,500
* Starts: January 30, 2024 1200 UTC
* Ends: February 03, 2024 1200 UTC

## Stats

* nSLOC: 1054
* Dollars per nSLOC: $21.35

## About the Project

Morpheus AI is a Smart Agent concept of connecting LLMs and AI Agents to wallets, Dapps, & smart contracts promises to open the world of Web3 to everyone. Chatting in normal language with your Smart Agent and having it understand the question or task, is similar to how Google's search engine opened the early internet up to the general public.

The project is launching using the Techno Capital Machine (TCM) model inspired by <https://twitter.com/BasedBeffJezos> and outlined here - <https://github.com/MorpheusAIs/Morpheus/blob/1b8abd0694940acc10a0b70611148d6e893ba017/!KEYDOCS%20README%20FIRST!/4.TechnoCapitalMachineTCM.md#L4>

The contract audit will cover the initial phases of the TCM development.

Users direct yield toward the open source project of their choice by depositing assets such as stETH into a Smart Contract. 50% of the daily yield purchases tokens in the open source project, which are contributed to an AMM trading pair as Protocol Owned Liquidity. 50% of the daily yield remains as stETH and is added to an AMM as the other half of the trading pair as Protocol Owned Liquidity. The open source project emits its native token to the contributor of the yield on a daily basis.

Later development of the project will ensure holders of the native tokens have access to the open source project’s utility.

\\[Documentation\\](See Github)[Website](https://mor.org) [Twitter](https://twitter.com/MorpheusAIs) [GitHub](https://github.com/MorpheusAIs/Morpheus/)

## Actors

Capital Provider

* Deposit stETH into the contract.
* Claim MOR Tokens
* Withdraw stETH from the contract

Code Provider

* imported into the smart contract

## Scope (contracts)

All items within the below directory<https://github.com/Cyfrin/2024-01-Morpheus>

```
├── contracts
│   ├── Distribution.sol
│   ├── L1Sender.sol
│   ├── L2MessageReceiver.sol
│   ├── L2TokenReceiver.sol
│   ├── MOR.sol
│   ├── interfaces
│   │   ├── IDistribution.sol
│   │   ├── IL1Sender.sol
│   │   ├── IL2MessageReceiver.sol
│   │   ├── IL2TokenReceiver.sol
│   │   ├── IMOR.sol
│   │   ├── tokens
│   │   │   ├── IStETH.sol
│   │   │   └── IWStETH.sol
│   │   └── uniswap-v3
│   │       └── INonfungiblePositionManager.sol
│   ├── libs
│   │   └── LinearDistributionIntervalDecrease.sol
│   └── mock
│       ├── DistributionV2.sol
│       ├── GatewayRouterMock.sol
│       ├── L1SenderV2.sol
│       ├── L2MessageReceiverV2.sol
│       ├── L2TokenReceiverV2.sol
│       ├── NonfungiblePositionManagerMock.sol
│       ├── SwapRouterMock.sol
│       └── tokens
│           ├── StETHMock.sol
│           └── WStETHMock.sol

```

## Compatibilities

The contract is EVM compatible, works with Arbitrum and integrates to Uniswap AMM.

Compatibiilities: Blockchains: - Ethereum/Arbitrum Tokens: - stETH - MOR

## Setup

```
git clone https://github.com/Cyfrin/2024-01-Morpheus.git
cd 2024-01-Morpheus

```

Build instructions can be found at <https://github.com/MorpheusAIs/SmartContracts/blob/dev/README.md>

## Known Issues:

---

* Users interacting with the MorpheusAI Smart Contracts must be aware of the privileged roles in the protocol and which actions these privileged roles can perform. Distribution.sol is the contract that will hold the user's staked funds i.e. a token such as stETH. Currently, there are mechanisms, controlled only by the owner of the contract, that can cause indefinite custody of the user's deposited tokens. In other words, users would never be able to withdraw their staked funds again. The owner role must be fully trusted.
* The alias of L1Sender.sol on Arbitrum will hold the ETH received as a gas refund from bridging tokens Context: L1Sender.sol, L2TokenReceiver.sol

Community Approach - Deploy a contract that can rescue the ETH on the L2 alias address of L1Sender. Or oth- erwise, accept that any excess ETH sent is lost and protect L1Sender.sendDepositToken() with a check that \\_msgSender() == distribution.

* Negative rebasing of stETH deposits in Distribution.sol can cause bank run and loss to new depositors.

The Distribution.\\_withdraw() function pays out deposits on a first-come-first-serve basis. This means if there occurs a slashing of staked ETH in Lido (negative rebasing), the stETH balance in Distribution is insufficient to serve all users. The Distribution contract accounts for this scenario by limiting the amount that can be withdrawn to the contract's balance: This may cause a \"bank-run\" where users want to withdraw their stETH as long as there is any left. Once this \"bank-run\" is over, there may be a pool deposits balance greater zero and a stETH balance equal to zero. When new depositors come in, they could lose their funds to existing depositors that withdraw. Recommendation: According to Lido docs, rebases have never been negative thus far. Tracking stETH deposits directly seems to be a deliberate decision by the Morpheus team. As such the issue is simply a reminder for users interacting with the Morpheus smart contracts and the finding can be acknowledged.

* Adjusted for a small lag in the system.
* UUPSUpgradeable contracts will implement a constructor with a call to Initializ- able.disableInitializers Context: Distribution.sol, L1Sender.sol, L2TokenReceiver, L2MessageReceiver.sol

Minimum - 1/3 yield - How far you take it out.

* LIDO Staking potential attack vector - There is a mismatch between re-base rewards issued from LIDO to the MOR Project and MOR rewards issued to stakers that withdraw stETH immediately prior to the rebase time each day. The 7 day lockup restricts the maximum variance to 12.5% \"boost\"

##### Navigation

[Home](/)[Contests](/contests) 

##### Resources

[Learn About Smart Contract Audits](https://www.youtube.com/watch?v=aOqhQvWhUG0)[Become an Expert Blockchain Developer](https://www.youtube.com/@PatrickAlphaC) 

© Copyright 2024, All Rights Reserved"