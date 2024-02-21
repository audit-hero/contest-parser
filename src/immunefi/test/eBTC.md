args /opt/homebrew/Cellar/node/21.3.0/bin/node,workspace/js/utils/read-url-as-md/src/index.ts,https://immunefi.com/bounty/ebtc-boost/,--playwright
Scraping https://immunefi.com/bounty/ebtc-boost/...

waiting 5000ms...
![](/_next/image/?url=%2Fimages%2Fgradient.png&w=3840&q=75)

[![Immunefi](/images/logo-white.svg)](/)

Open menu

![Immunefi](/images/logo-white.svg)

Close menu

[How it works - Whitehats](/hackers/)[Learn](/learn/)[Whitehat leaderboard](/leaderboard/)[How it works - Projects](/projects/)[Boost](/boost/)[Managed Triage](/managed-triage/)[Vaults](/vaults/)[Login](https://bugs.immunefi.com/?utm%5Fsource=immunefi)[Explore bounties](/explore/)

Projects

[How it Works](/projects/)[Help for Projects](https://immunefisupport.zendesk.com/hc/en-us/categories/5425505980817-For-Projects?utm%5Fsource=immunefi)[Vaults](/vaults/)

Whitehats

[How it Works](/hackers/)[Help for Whitehats](https://immunefisupport.zendesk.com/hc/en-us/categories/5425506638353-For-Whitehats?utm%5Fsource=immunefi)[Learn](/learn/)[Leaderboard](/leaderboard/)[Immunefi Top 10 Bugs](/immunefi-top-10/)[Whitehat Awards](/whitehat-awards/)[Whitehat Hall of Fame](/hall-of-fame/)

[Managed Triage](/managed-triage/)[Boost](/boost/)[Login](https://bugs.immunefi.com/?utm%5Fsource=immunefi)[Explore bounties](/explore/)

# Boosted | eBTC

Triaged by **Immunefi**

[Submit a Bug](https://bugs.immunefi.com/?utm%5Fsource=immunefi)

###  Live

12d: 6h remaining

Started

19 February 2024

Ends

04 March 2024

Rewards Token

USDC

Rewards Pool

200,000 USDC

Max Bounty

$200,000

nSLOC

5,000

KYC Required

No

### This Boost Is Live!

$200,000 USD is available in rewards for finding bugs in eBTC’s codebase of about 5000 nSLOC. There is no KYC and anyone may participate, except for official contributors that are currently involved (past contributors may participate).

BadgerDAO, the creators of eBTC, will respond within 24 hours on weekdays to all bug reports. Any technical questions and support requests can be asked directly to BadgerDAO or Immunefi in the [BadgerDAO Boost Discord channel](https://discord.com/channels/787092485969150012/1207523219880280104?utm%5Fsource=immunefi).

When the Boost has ended Immunefi will publish an event-specific leaderboard and bug reports from the event.

The Boost is primarily concerned with the loss of user funds.

Started

**19 February 2024 08:00 UTC**

Ends

**04 March 2024 08:00 UTC**

### Program Overview

eBTC is a collateralized crypto asset soft pegged to the price of Bitcoin and built on the Ethereum network. It is based on the Liquity protocol and backed exclusively by Staked Ether (stETH). The protocol is designed with an immutable core with minimized counterparty reliance and governance.

It’s designed to be the most decentralized synthetic BTC in DeFi and offers the ability for anyone in the world to borrow BTC at no cost.

After locking up stETH as collateral and creating an individual position called a CDP, the user can get instant liquidity by minting eBTC. Each CDP is required to be collateralized at a fixed minimum ratio determined by the protocol.

The redemption and liquidation mechanisms help ensure that stability is maintained through economically-driven user interactions and arbitrage, rather than through active governance or monetary interventions.

eBTC is built by [BadgerDAO](https://badger.com/?utm%5Fsource=immunefi). For more information about eBTC, please visit [twitter](https://twitter.com/eBTCprotocol?utm%5Fsource=immunefi) and the [docs](https://docs.ebtc.finance/ebtc/?utm%5Fsource=immunefi).

### Rewards by Threat Level

The reward pool will be fully distributed among participants. The size depends on the bugs found:

* If no High or Critical severity bugs are found the reward pool will be $50,000 USD
* If one or more High severity bugs are found the reward pool will be $100,000 USD
* If one or more Critical severity bugs are found the reward pool will be $200,000 USD

For this boost, duplicates and private known issues are valid for a reward.

These reward terms are a summary, for the full details read our [eBTC Boost Reward Terms](https://immunefisupport.zendesk.com/hc/en-us/articles/22591362396689-eBTC-Boost-Reward-Terms?utm%5Fsource=immunefi).

Rewards are distributed according to the impact of the vulnerability based on the [Immunefi Vulnerability Severity Classification System V2.3](https://immunefi.com/immunefi-vulnerability-severity-classification-system-v2-3/).

**Reward Payment Terms**

Payouts are handled by the BadgerDAO team directly and are denominated in USD. However, payments are done in USDC.

Rewards will be distributed all at once based on Immunefi’s distribution terms after the event has concluded and the final bug reports have been resolved.

**Smart Contract**

Critical

Level

USD $200,000

Payout

PoC Required

High

Level

USD $100,000

Payout

PoC Required

Medium

Level

USD $50,000

Payout

PoC Required

Low

Level

USD $50,000

Payout

PoC Required

### Assets in scope

* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/ActivePool.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/ActivePool.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/ActivePool.sol")  
Target  
Smart Contract - ActivePool.sol - 224 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/BorrowerOperations.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/BorrowerOperations.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/BorrowerOperations.sol")  
Target  
Smart Contract - BorrowerOperations.sol - 754 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/CdpManager.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/CdpManager.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/CdpManager.sol")  
Target  
Smart Contract - CdpManager.sol - 588 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/LiquidationLibrary.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/LiquidationLibrary.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/LiquidationLibrary.sol")  
Target  
Smart Contract - LiquidationLibrary.sol - 710 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/CollSurplusPool.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/CollSurplusPool.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/CollSurplusPool.sol")  
Target  
Smart Contract - CollSurplusPool.sol - 95 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/EBTCToken.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/EBTCToken.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/EBTCToken.sol")  
Target  
Smart Contract - EBTCToken.sol - 223 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/Governor.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/Governor.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/Governor.sol")  
Target  
Smart Contract - Governor.sol - 127 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/PriceFeed.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/PriceFeed.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/PriceFeed.sol")  
Target  
Smart Contract - PriceFeed.sol - 496 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/SortedCdps.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/SortedCdps.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/SortedCdps.sol")  
Target  
Smart Contract - SortedCdps.sol - 399 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/EbtcFeed.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/EbtcFeed.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/EbtcFeed.sol")  
Target  
Smart Contract - EbtcFeed.sol - 105 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/ChainlinkAdapter.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/ChainlinkAdapter.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/ChainlinkAdapter.sol")  
Target  
Smart Contract - ChainlinkAdapter.sol - 93 nSLOC  
Type
* [https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/FixedAdapter.sol](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/FixedAdapter.sol?utm%5Fsource=immunefi "https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/FixedAdapter.sol")  
Target  
Smart Contract - FixedAdapter.sol - 48 nSLOC  
Type
* Primacy Of Impact  
Target  
Smart Contract  
Type

All eBTC contracts will be deployed shortly and the assets in the ‘assets in scope’ table above will be updated with the live contracts. These will be fully identical with the code in the github links.

BadgerDAO’s up to date codebase can be found at [https://github.com/ebtc-protocol/ebtc/tree/release-0.7](https://github.com/ebtc-protocol/ebtc/tree/release-0.7?utm%5Fsource=immunefi)

**Whitehat Educational Resources & Technical Info**

* [Read the changelog here](https://github.com/ebtc-protocol/ebtc/pull/766?utm%5Fsource=immunefi) to learn the differences between this release and the [previous Code4rena contest](https://code4rena.com/audits/2023-10-badger-ebtc-audit-certora-formal-verification-competition?utm%5Fsource=immunefi).
* [Primary documentation](https://docs.ebtc.finance/ebtc/?utm%5Fsource=immunefi)
* [Primary Readme](https://github.com/code-423n4/2023-10-badger/blob/main/README%5FEBTC.md?utm%5Fsource=immunefi)
* [In-depth Introductory Video](https://www.youtube.com/watch?v=QWIB4avTkt4&utm%5Fsource=immunefi)
* [eBTC Cheatsheet](https://gist.github.com/GalloDaSballo/7b060bb97de09c539ec64c533dd352c6?utm%5Fsource=immunefi) with additional videos and an up to date list of additional resources
* Website: [ebtc.finance](https://www.ebtc.finance/?utm%5Fsource=immunefi)
* Twitter: [eBTCProtocol](https://twitter.com/eBTCprotocol?utm%5Fsource=immunefi)
* [JohnnyTime eBTC Overview](https://www.youtube.com/watch?v=f2numPMZFSI&t=1s&utm%5Fsource=immunefi)
* [eBTC x Immunefi Technical Walkthrough](https://www.youtube.com/watch?v=0%5FTb8GitY8w&utm%5Fsource=immunefi)

**Is this an upgrade of an existing system? If so, which? And what are the main differences?**

No, this is a net new protocol with no relation to past BadgerDAO projects.

**Where do you suspect there may be bugs?**

We are concerned around core accounting (yield split and debt redistribution), the ability to abuse or significantly DOS the liquidation or redemption mechanics, and significant rounding errors.

Here is our [full list of invariants](https://github.com/ebtc-protocol/ebtc/blob/release-0.7/packages/contracts/contracts/TestContracts/invariants/PropertiesDescriptions.sol?utm%5Fsource=immunefi).

Calling out accounting invariants:

* Cdps have a pending accounting state that is only updated when that Cdp is interacted with. Cdps can stay out of sync for a long time, there is no way to force them to synchronize unless the owner or approved positionManager interacts with the Cdp.
* For numerical exploits, the total stETH in existence or that could be in existence must be considered.
* Loss of yield must be considered relative to other changes. For example, if a bunch of positive rebases happen and then there’s a slash, and the system is not updated until that point, those positive rebases will be lost.
* Max 1 wei of unallocated debt per Cdp per debt redisttribution event is a theoretical maximum that can happen. This does not scale to a reasonable value with real-world values.
* SortedCdps view functions are not for on-chain users.

**What ERC20 / ERC721 / ERC777 / ERC1155 token standards are supported? Which are not?**

stETH is supported as collateral, which is a rebasing token. The eBTC token is “standard” as far as these properties go.

**What emergency actions may you want to use as a reason to invalidate or downgrade an otherwise valid bug report?**

Emergency actions could involve:

* pausing flashloans
* pausing redemptions
* switching between the stETH 1:1 fixed oracle to the stETH/ETH market rate oracle

**What Roles are there, and what capacities do they have?**

There are a number of roles maintained by the Governor contract.

It has role-based access control that gates function signatures by role, based on [solmate RolesAuthority](https://github.com/transmissions11/solmate/blob/main/src/auth/authorities/RolesAuthority.sol?utm%5Fsource=immunefi).

The following roles exist in the system:

Role 0: // The Admin, manages the setting of roles and associated properties

* governor.setRoleName()
* governor.setUserRole()
* governor.setRoleCapability()
* governor.setPublicCapability()
* governor.burnCapability()
* governor.transferOwnership()
* governor.setAuthority()

Role 1: // Extensible minter, can mint eBTC tokens at-will. Unused at the start.

* ebtcToken.mint(address,uint256)

Role 2: // Extensible burner, can burn eBTC tokens at will. Unused at the start.

* ebtcToken.burn(address,uint256)
* ebtcToken.burn(uint256)

Role 3: // Redemption and yield split parameter manager

* cdpManager.setStakingRewardSplit(uint256)
* cdpManager.setRedemptionFeeFloor(uint256)
* cdpManager.setMinuteDecayFactor(uint256)
* cdpManager.setBeta(uint256)
* cdpManager.setGracePeriod(uint256)

Role 4: // Emergency pauser

* cdpManager.setRedemptionsPaused(bool)
* activePool.setFlashLoansPaused(bool)
* borrowerOperations.setFlashLoansPaused(bool)

5: // Flashloan fee parameter manager

* borrowerOperations.setFeeBps(uint256)
* activePool.setFeeBps(uint256)

6: // Token sweeper. Note that the sweeping recipient is pre-set and members of this role can’t claim the tokens to themselves.

* activePool.sweepToken(address,uint256)
* collSurplusPool.sweepToken(address,uint256)

7: // Fee recipient sweeper

* activePool.claimFeeRecipientCollShares(uint256)

8: // Primary oracle manager

* ebtcFeed.setPrimaryOracle(address)

9: // Secondary oracle manager

* ebtcFeed.setSecondaryOracle(address)

10: // Price Feed fallback manager

* priceFeed.setFallbackCaller(address)

11: // stETH 1:1 to market rate switcher, coupled with appropriate redemption rate change. Unused initially, but intended to give to a bot with security guardrails around conditions where sETH/ETH feed is appropriate.

* priceFeed.setCollateralFeedSource(bool)
* cdpManager.setRedemptionFeeFloor(uint256)

**There are five permissioned contracts**

1. High Security Timelock

The ultimate governance administrator also holds most permissions. The only permissions it doesn’t have are eBTC minting and burning (which no contract has in this configuration)

Roles: \[0, 3, 4, 5, 6, 7, 8, 9, 10\]

1. Low Security Timelock

A faster timelock that can perform all but the most sensitive operations. It notably doesn’t have admin capabilities on the Governor, or the ability to swap primary oracle.

Roles: \[3, 4, 5, 6, 7, 9, 10\]

1. Security Multisig

The higher security multisig. It can propose transactions into the high security and low security timelocks and call pausing functions directly

Roles: \[4\]

1. Tech Ops Multisig

The lower security multisig. It can propose transactions into the low security timelock and call pausing functions directly.

Roles: \[4\]

1. Fee Recipient Multisig

Manages the yield split fee collections serving as a destination for sweeping tokens.

Roles: \[6, 7\]

**What external dependencies are there?**

We’ve got a short list for eBTC.

* Chainlink oracles
* stETH token

**Where might whitehats confuse out-of-scope code to be in-scope?**

Files in the repo that are not specifically in scope are the most likely source of confusion, such as test files. This project has a low number of external dependencies and doesn’t interact with much.

Assume the PriceFeed.sol will never have the fallback oracle assigned, this will remain at zero. This governance capability can be permanently burned to enable this spec.

Unbounded gas is effectively possible via poor hint selection, this is known and should not constitute an unbounded gas finding

**Are there any unusual points about your protocol that may confuse whitehats?**

The rebasing nature of the stETH token and conversion between balances and shares.

**What is the test suite setup information?**

We have several test suites, they can be found here:

* [Hardhat test directory](https://github.com/ebtc-protocol/ebtc/tree/release-0.7/packages/contracts/test?utm%5Fsource=immunefi)
* [Foundry test directory](https://github.com/ebtc-protocol/ebtc/tree/release-0.7/packages/contracts/foundry%5Ftest?utm%5Fsource=immunefi)
* Several Echdina/Medusa configs

**Public Disclosure of Known Issues**

Bug reports covering previously-discovered bugs (listed below) are not eligible for a reward within this program. This includes known issues that the project is aware of but has consciously decided not to “fix”, necessary code changes, or any implemented operational mitigating procedures that can lessen potential risk.

* Account's stETH balance getting lower on 1 or 2 wei due to rounding down integer math: [https://github.com/lidofinance/lido-dao/issues/442](https://github.com/lidofinance/lido-dao/issues/442?utm%5Fsource=immunefi)
* Steal of shares using transferSharesFrom due to math rounding issues: [https://github.com/lidofinance/lido-dao/issues/796](https://github.com/lidofinance/lido-dao/issues/796?utm%5Fsource=immunefi)
* Redeem to change partial NICR in order to grief redemption, or, open a cdp that front-runs the redemption to grief the redemption: [https://github.com/code-423n4/2023-10-badger-findings/issues/226](https://github.com/code-423n4/2023-10-badger-findings/issues/226?utm%5Fsource=immunefi)
* stETH upgrade risk is considered known
* Unbounded gas is via poor hint selection
* Chainlink misbehaviour and single privilege is considered known
* Known Rounding Behaviour: Debt Redistribution Precision Loss:  
   * Every time a Cdp updates with one or more pending debt redistribution events, it can possibly lose 1 wei of debt to rounding. This 1 wei of debt will still be accounted for in systemDebt. This is “rounding against the protocol” in the sense that the systemDebt will become 1 wei higher than the sum of all active Cdp debt for each instance of this occuring. It’s unbounded. This leads to a theoretical maximum differential of 1 wei per Cdp per debt redistribution event between the sum of all active Cdp debt and the systemDebt.
* Known Rounding Behaviour: Collateral Rebase Precision Loss:  
   * However, this rounding behavior also exists during collateral rebase events. In this case it “rounds against the user”. Each time a Cdp is updated with any pending rebases to apply, it can lose 1 wei of collateral versus what it would have mathematically speaking due to precision loss of division. The systemCollShares becomes 1 wei higher than the sum of all active Cdp collShares in this instance. This leads to a theoretical maximum differential of 1 wei per Cdp per rebase event between the systemCollShares and the sum of all active Cdp collShares.
* SortedCdps list can get out of order with debt redistribution. This is considered acceptable and does not affect liquidations, only redemption ordering.

**Previous Audits**

BadgerDAO’s has provided these completed audit review reports for reference. Any unfixed vulnerabilities mentioned in these reports are not eligible for a reward.

* RiskDAO: [https://github.com/Risk-DAO/Reports/blob/main/eBTC.pdf](https://github.com/Risk-DAO/Reports/blob/main/eBTC.pdf?utm%5Fsource=immunefi)
* Trust: [https://badger.com/images/uploads/trust-ebtc-audit-report.pdf](https://badger.com/images/uploads/trust-ebtc-audit-report.pdf?utm%5Fsource=immunefi)
* Spearbit: [https://badger.com/images/uploads/ebtc-security-review-spearbit.pdf](https://badger.com/images/uploads/ebtc-security-review-spearbit.pdf?utm%5Fsource=immunefi)
* Cantina: [https://badger.com/images/uploads/ebtc-security-review-cantina.pdf](https://badger.com/images/uploads/ebtc-security-review-cantina.pdf?utm%5Fsource=immunefi)
* Code4rena: [https://code4rena.com/reports/2023-10-badger](https://code4rena.com/reports/2023-10-badger?utm%5Fsource=immunefi)
* Shung: [https://gist.github.com/Shungy/ebeb9366e970ecbf4da1eda296581e47](https://gist.github.com/Shungy/ebeb9366e970ecbf4da1eda296581e47?utm%5Fsource=immunefi)

### Asset In Scope Policies

**Asset Accuracy Assurance**

Bugs found on assets incorrectly listed in-scope will be considered valid and be rewarded.

**Private Known Issues Reward Policy**

Private known issues, meaning known issues that were not publicly disclosed, are considered valid, but will be downgraded by one severity.

**Known Issue Assurance**

BadgerDAO commits to providing Known Issue Assurance to bug submissions through their program. This means that BadgerDAO will either disclose known issues publicly, or at the very least, privately via a self-reported bug submission.

In a potential scenario of a mediation, this allows for a more objective and streamlined process, in order to prove that an issue is known. Otherwise, assuming the bug report is valid, it would result in the report being considered as in-scope, and due a reward.

**Primacy of Impact vs Primacy of Rules**

BadgerDAO adheres to the Primacy of Impact for all impacts.

Primacy of Impact means that the impact is prioritized rather than a specific asset. This encourages security researchers to report on all bugs with an in-scope impact, even if the affected assets are not in scope. For more information, please see [Best Practices: Primacy of Impact ](https://immunefisupport.zendesk.com/hc/en-us/articles/12340245635089-Best-Practices-Primacy-of-Impact?utm%5Fsource=immunefi)

When submitting a report on Immunefi’s dashboard, the security researcher should select the Primacy of Impact asset placeholder. If the team behind this project has multiple programs, those other programs are not covered under Primacy of Impact for this program. Instead, check if those other projects have a bug bounty program on Immunefi.

If the project has any testnet and/or mock files, those will not be covered under Primacy of Impact.

### Impacts in scope

Only the following impacts are accepted within this bug bounty program. All other impacts are not considered as in-scope, even if they affect something in the assets in scope table.

#### Smart Contract

* Manipulation of governance voting result deviating from voted outcome and resulting in a direct change from intended effect of original results  
Critical  
Impact
* Direct theft of 2 stETH worth of any user funds, whether at-rest or in-motion, other than unclaimed yield  
Critical  
Impact
* Permanent freezing of funds  
Critical  
Impact
* Protocol insolvency  
Critical  
Impact
* Theft of unclaimed yield  
High  
Impact
* Permanent freezing of unclaimed yield  
High  
Impact
* Temporary freezing of funds for at least 15 minutes  
High  
Impact
* Smart contract unable to operate due to lack of token funds  
Medium  
Impact
* Block stuffing  
Medium  
Impact
* Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)  
Medium  
Impact
* Theft of gas  
Medium  
Impact
* Unbounded gas consumption  
Medium  
Impact
* Contract fails to deliver promised returns, but doesn't lose value  
Low  
Impact

**Proof of Concept (PoC) Requirements**

A PoC, demonstrating the bug's impact, is required for this program and has to comply with the [Immunefi PoC Guidelines and Rules](https://immunefisupport.zendesk.com/hc/en-us/articles/9946217628561-Proof-of-Concept-PoC-Guidelines-and-Rules?utm%5Fsource=immunefi).

**Impacts caused by exploiting external dependencies**

Critical & High severity impacts caused by exploiting external dependencies (such as Chainlink oracles and OpenZepplin libraries) are considered valid and in-scope, however they will be downgraded to Medium severity from the assessed impact.

Medium & Low severity impacts caused by exploiting external dependencies (such as Chainlink oracles and OpenZepplin libraries) are considered invalid and out-of-scope from the assessed impact.

**Feasibility Limitations**

For a Critical or High severity impact related to Loss of Yield, Precision Loss or insolvency the issue needs to demonstrate a loss higher than $500 with a 2 stETH Cdp (which would be the minimal threshold for insolvency for eBTC).

Magnitude matters when evaluating the validity of Critical & High severity impacts. Notably when discussing theft of funds, protocol insolvency, and theft of unclaimed yield. With this protocol, assume:

* System TVL is between $1m and $1b at $2500 ETH. Meaning 400 stETH to 400,000 stETH total collateral
* Absolute value of loss must be greater than 10% to qualify as protocol insolvency because any damage below 10% will not cause protocol insolvency in the worst case scenario due to the minimum Collateral Ratio being 110%.
* 100,000 maximum Cdps
* No more than 36,500 rebases and 10,000 bad debt redistribution events

POCs that demonstrate impacts with conditions outside of this range will be considered valid but downgraded to Medium severity due to practical infeasibility.

### Miscellaneous Policies

**Eligibility Criteria**

Security researchers who wish to participate must adhere to the rules of engagement set forth in this program and cannot be:

* On OFACs SDN list
* Official contributors that are currently involved (past contributors may participate)

**Responsible Publication**

Whitehats may publish their bug reports after they have been fixed & paid, or closed as invalid, with the following exceptions:

* Bug reports in mediation may not be published until mediation has concluded and the bug report is resolved.

Immunefi may publish bug reports submitted to this boosted bug bounty and a leaderboard of the participants and their earnings.

**Feasibility Limitations**

The project may be receiving reports that are valid (the bug and attack vector are real) and cite assets and impacts that are in scope, but there may be obstacles or barriers to executing the attack in the real world. In other words, there is a question about how feasible the attack really is. Conversely, there may also be mitigation measures that projects can take to prevent the impact of the bug, which are not feasible or would require unconventional action and hence, should not be used as reasons for downgrading a bug's severity.

Therefore, Immunefi has developed a set of [feasibility limitation standards](https://immunefisupport.zendesk.com/hc/en-us/articles/16913132495377-Feasibility-Limitation-Standards?utm%5Fsource=immunefi) which by default states what security researchers, as well as projects, can or cannot cite when reviewing a bug report.

### Out of Scope & Rules

These impacts are out of scope for this bug bounty program.

**All Categories:**

* Impacts requiring attacks that the reporter has already exploited themselves, leading to damage
* Impacts caused by attacks requiring access to leaked keys/credentials
* Impacts caused by attacks requiring access to privileged addresses (governance, strategist) except in such cases where the contracts are intended to have no privileged access to functions that make the attack possible
* Impacts relying on attacks involving the depegging of an external stablecoin where the attacker does not directly cause the depegging due to a bug in code
* Mentions of secrets, access tokens, API keys, private keys, etc. in Github will be considered out of scope without proof that they are in-use in production
* Best practice recommendations
* Feature requests
* Impacts on test files and configuration files unless stated otherwise in the bug bounty program

**Blockchain/DLT & Smart Contract Specific:**

* Incorrect data supplied by third party oracles  
   * Not to exclude oracle manipulation/flash loan attacks
* Impacts requiring basic economic and governance attacks (e.g. 51% attack)
* Lack of liquidity impacts
* Impacts from Sybil attacks
* Impacts involving centralization risks

**Prohibited Activities:**

* Any testing on mainnet or public testnet deployed code; all testing should be done on local-forks of either public testnet or mainnet
* Any testing with pricing oracles or third-party smart contracts
* Attempting phishing or other social engineering attacks against our employees and/or customers
* Any testing with third-party systems and applications (e.g. browser extensions) as well as websites (e.g. SSO providers, advertising networks)
* Any denial of service attacks that are executed against project assets
* Automated testing of services that generates significant amounts of traffic
* Public disclosure of an unpatched vulnerability in an embargoed bounty

![](/images/logo-gradient.svg)

[Hackers](/hackers/)[Projects](/projects/)[Terms of Use](/terms-of-use/)[Safe Harbor](/safe-harbor/)

[About](/about/)[Rules](/rules/)[Press](/press/)[Brand Assets](https://drive.google.com/drive/u/0/folders/1fKFxkLccjKwvVD6YWPeWJgCxs76z5Pwf?utm%5Fsource=immunefi)[Research](/research/)

[Blog](https://medium.com/immunefi?utm%5Fsource=immunefi)[Contact](/contact/)[Help](https://immunefisupport.zendesk.com/?utm%5Fsource=immunefi)[Privacy](/privacy-policy/)[Careers](https://boards.greenhouse.io/immunefi?utm%5Fsource=immunefi)[Employee Verification](/employee-verification/)

Hackers subscribed to our newsletter are   
 more likely to earn a Bounty

Prove it

[Twitter](https://twitter.com/immunefi?utm%5Fsource=immunefi)[Discord](https://discord.gg/rpkPDR7pVV?utm%5Fsource=immunefi)[Telegram](https://t.me/immunefi?utm%5Fsource=immunefi)[Medium](https://medium.com/immunefi?utm%5Fsource=immunefi)[Youtube](https://www.youtube.com/channel/UCmulw2BHpP6IiBM0Re0yP5Q?utm%5Fsource=immunefi)[LinkedIn](https://www.linkedin.com/company/immunefi?utm%5Fsource=immunefi)

Copyright © Immunefi – Crypto bug bounty platform
