[How it works](/welcome#how-it-works)[Services](/welcome#services)[FAQ](/welcome#faq)[Competitions](/competitions)

[Sign in](/login)

[How it works](/welcome#how-it-works)[Services](/welcome#services)[FAQ](/welcome#faq)[Competitions](/competitions)[Sign in](/login)

1. [Competitions](/competitions)
2. metamorpho-and-periphery

![profile image](https://imagedelivery.net/wtv4_V7VzVsxpAFaxzmpbw/49be999a-a44f-4d2e-de7c-ea3a11173300/public)

Morpho \\- metamorpho-and-periphery

# Metamorpho and Periphery Competition

Morpho Labs has teamed up with Cantina for the inaugural public security review competition hosted on their new platform by security researchers for security researchers.

The competition at a glance:

* November 16th 10:00 UTC to December 7th 10:00 UTC
* $100k total prize pool.

### What is Morpho Blue and MetaMorpho

Morpho Blue and MetaMorpho form part of the vision to rebuild decentralized lending in layers, with MetaMorpho enabling any lending experience to be rebuilt on a shared and immutable base layer: Morpho Blue.

Morpho Blue is a trustless lending primitive that offers unparalleled efficiency and flexibility. It enables the creation of isolated lending markets by specifying any loan asset, any collateral asset, a liquidation LTV (LLTV), an oracle, and an interest rate model.

MetaMorpho is a protocol for lending vaults built on Morpho Blue. Anyone can create a vault that allocates to multiple Morpho Blue markets. Each vault is curated to provide suppliers with tailored risk exposures, better yields, and greater transparency.

Visit the [docs](https://www.notion.so/00ff8194791045deb522821be46abbdc?pvs=21) for a complete project overview.

### Prize distribution and scoring

The prize distribution works as follows:

* Security reviewers will score points for each finding.
* Prizes are distributed proportionally to the number of points scored.
* A High Severity is worth 10 points, and a Medium Severity 3 points.
* Duplicate findings will be resolved using a scoring formula that incentivizes unique findings.
* Duplicate findings will be resolved using the following scoring formula that incentivizes unique findings:  
   * Each duplicate finding will be scaled down by `0.9n−1/n0.9^{n - 1} / n0.9n−1/n`, where `nnn` is the # of duplicates.
* 10% of the prize pot is reserved for Low Severity or informational findings. These reports are judged based on quality and researchers are then ranked from 1st to 5th for the purpose of prize allocation:  
   * 1st: $5k  
   * 2nd: $2.5k  
   * 3rd: $1.25k  
   * 4th: $625  
   * 5th: $625

## Scope

Check out the previously recorded read through of the repos for both competitions on [cantina twitter](https://twitter.com/cantinaxyz/status/1722658075226800296).

### Morpho Blue IRM

* Repository: [morpho-org/morpho-blue-irm](https://github.com/morpho-org/morpho-blue-irm/tree/c2b1732fc332d20a001ca505aea76bd475e95ef1)
* Commit: c2b1732fc332d20a001ca505aea76bd475e95ef1
* Total LOC: 134
* Files: all files in `src`

| File                        | blank  | comment | code    |
| --------------------------- | ------ | ------- | ------- |
| src/SpeedJumpIrm.sol        | 27     | 45      | 87      |
| src/libraries/MathLib.sol   | 10     | 16      | 29      |
| src/libraries/ErrorsLib.sol | 6      | 11      | 9       |
| src/libraries/UtilsLib.sol  | 1      | 9       | 9       |
| **SUM:**                    | **44** | **81**  | **134** |

### Morpho Blue Oracles

* Repository: [morpho-org/morpho-blue-oracles](https://github.com/morpho-org/morpho-blue-oracles/tree/d351d3e59b207729d785ec568ed0d2ee24498189)
* Commit: d351d3e59b207729d785ec568ed0d2ee24498189
* Total LOC: 92
* Files: all files in `src`

| File                                     | blank  | comment | code   |
| ---------------------------------------- | ------ | ------- | ------ |
| src/ChainlinkOracle.sol                  | 9      | 46      | 46     |
| src/libraries/ChainlinkDataFeedLib.sol   | 7      | 13      | 15     |
| src/interfaces/AggregatorV3Interface.sol | 5      | 3       | 14     |
| src/libraries/VaultLib.sol               | 3      | 7       | 8      |
| src/libraries/ErrorsLib.sol              | 2      | 7       | 5      |
| src/interfaces/IERC4626.sol              | 1      | 4       | 4      |
| **SUM:**                                 | **27** | **77**  | **92** |

## MetaMorpho

* Repository: [morpho-org/metamorpho](https://github.com/morpho-org/metamorpho/tree/f4e2574029743088a8800149593fa997ab66f0f8)
* Commit: f4e2574029743088a8800149593fa997ab66f0f8
* Total LOC: 642
* Files: all files in `src` except the `mocks` folder

| File                                   | blank   | comment | code    |
| -------------------------------------- | ------- | ------- | ------- |
| src/MetaMorpho.sol                     | 202     | 183     | 477     |
| src/interfaces/IMetaMorpho.sol         | 17      | 11      | 65      |
| src/libraries/EventsLib.sol            | 22      | 34      | 37      |
| src/MetaMorphoFactory.sol              | 13      | 20      | 26      |
| src/libraries/ErrorsLib.sol            | 21      | 26      | 24      |
| src/libraries/ConstantsLib.sol         | 5       | 10      | 8       |
| src/interfaces/IMorphoMarketParams.sol | 2       | 1       | 5       |
| **SUM:**                               | **282** | **285** | **642** |

## Morpho Blue Bundlers

* Repository: [morpho-org/morpho-blue-bundlers](https://github.com/morpho-org/morpho-blue-bundlers/tree/5099e5fef9a82a500b875eb81b90c2deca1de243)
* Commit: 5099e5fef9a82a500b875eb81b90c2deca1de243
* Total LOC: 983
* Files: all files in `src` except the `mocks` and `goerli` folders

| File                                                      | blank   | comment  | code    |
| --------------------------------------------------------- | ------- | -------- | ------- |
| src/migration/interfaces/IAaveV3.sol                      | 41      | 356      | 126     |
| src/MorphoBundler.sol                                     | 39      | 84       | 112     |
| src/migration/interfaces/IAaveV2.sol                      | 24      | 157      | 80      |
| src/migration/interfaces/IAaveV30ptimizer.sol             | 12      | 3        | 72      |
| src/ERC4626Bundler.sol                                    | 27      | 45       | 47      |
| src/migration/CompoundV3MigrationBundler.sol              | 16      | 38       | 41      |
| src/migration/interfaces/ICompoundV3.sol                  | 16      | 1        | 36      |
| src/migration/AaveV30ptimizerMigrationBundler.sol         | 15      | 42       | 35      |
| src/migration/CompoundV2MigrationBundler.sol              | 20      | 28       | 34      |
| src/StEthBundler.sol                                      | 20      | 26       | 33      |
| src/BaseBundler.sol                                       | 17      | 26       | 32      |
| src/TransferBundler.sol                                   | 15      | 26       | 28      |
| src/WNativeBundler.sol                                    | 17      | 24       | 26      |
| src/interfaces/IWstEth.sol                                | 2       | 1        | 25      |
| src/UrdBundler.sol                                        | 5       | 14       | 22      |
| src/ethereum/EthereumBundler.sol                          | 4       | 6        | 22      |
| src/Permit2Bundler.sol                                    | 8       | 13       | 20      |
| src/migration/AaveV2MigrationBundler.sol                  | 13      | 25       | 20      |
| src/migration/AaveV3MigrationBundler.sol                  | 13      | 24       | 20      |
| src/migration/MigrationBundler.sol                        | 7       | 9        | 16      |
| src/ethereum/EthereumPermitBundler.sol                    | 4       | 15       | 15      |
| src/PermitBundler.sol                                     | 3       | 16       | 14      |
| src/ethereum/interfaces/IDaiPermit.sol                    | 2       | 10       | 14      |
| src/interfaces/IMorphoBundler.sol                         | 2       | 5        | 13      |
| src/libraries/ErrorsLib.sol                               | 12      | 17       | 13      |
| src/migration/interfaces/ICToken.sol                      | 8       | 1        | 11      |
| src/migration/interfaces/ICEth.sol                        | 7       | 1        | 10      |
| src/interfaces/IStEth.sol                                 | 5       | 1        | 8       |
| src/ethereum/libraries/MainnetLib.sol                     | 4       | 5        | 7       |
| src/ethereum/migration/AaveV2EthereumMigrationBundler.sol | 4       | 6        | 7       |
| src/interfaces/IWNative.sol                               | 1       | 1        | 7       |
| src/ethereum/EthereumStEthBundler.sol                     | 4       | 6        | 6       |
| src/interfaces/IMulticall.sol                             | 1       | 7        | 4       |
| src/migration/interfaces/IComptroller.sol                 | 1       | 1        | 4       |
| src/libraries/ConstantsLib.sol                            | 2       | 3        | 3       |
| **SUM:**                                                  | **391** | **1043** | **983** |

## Universal Rewards Distributor

* Repository: [morpho-org/universal-rewards-distributor](https://github.com/morpho-org/universal-rewards-distributor/tree/94a604c926a4878661f38a8f3b05cd61c95c7b84)
* Commit: 94a604c926a4878661f38a8f3b05cd61c95c7b84
* Total LOC: 181
* Files: all files in `src`

| File                                            | blank  | comment | code    |
| ----------------------------------------------- | ------ | ------- | ------- |
| src/UniversalRewardsDistributor.sol             | 48     | 65      | 100     |
| src/interfaces/IUniversalRewardsDistributor.sol | 6      | 9       | 28      |
| src/UrdFactory.sol                              | 8      | 14      | 24      |
| src/libraries/EventsLib.sol                     | 8      | 31      | 19      |
| src/libraries/ErrorsLib.sol                     | 7      | 12      | 10      |
| **SUM:**                                        | **77** | **131** | **181** |

## ERC20Permissioned

* Repository: [morpho-org/erc20-permissioned](https://github.com/morpho-org/erc20-permissioned/tree/5176577690da4611a2c4de7a2591d431458ffb27)
* Commit: 5176577690da4611a2c4de7a2591d431458ffb27
* Total LOC: 55
* Files: all files in `src`

| File                          | blank | comment | code |
| ----------------------------- | ----- | ------- | ---- |
| src/ERC20PermissionedBase.sol | 25    | 33      | 55   |

## Out of Scope issues

Any findings on the previous review from OpenZeppelin / Cantina Managed review will be considered out of scope.

On top of that, automated findings from [4nalyzer](https://gist.github.com/hrkrshnn/9bd4d0ee06d66c2f75db5044cb5fd399) will also be considered out of scope.

## Summary

Status

Live

Total reward:

$100,000 USDC

Start date:

16 Nov 2023 12:00am UTC

End date:

7 Dec 2023 12:00am UTC

You need to be logged in as a researcher in order to join.

Join competition

© 2023 Cantina. All rights reserved