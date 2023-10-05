export interface Projects {
  data: Data;
}

export interface Data {
  masters:  { [key: string]: null | string }[];
  userNfts: any[];
  vaults:   VaultElement[];
  payouts:  Payout[];
}

export interface Payout {
  id:                  string;
  vault:               PayoutVault;
  payoutDataHash:      null | string;
  beneficiary:         string;
  approvedAt:          string;
  dismissedAt:         null;
  bountyPercentage:    null | string;
  severityIndex:       null | string;
  hackerReward:        string;
  hackerVestedReward:  string;
  governanceHatReward: string;
  hackerHatReward:     string;
  committeeReward:     string;
  isChallenged:        boolean | null;
}

export interface PayoutVault {
  id: string;
}

export interface VaultElement {
  id:                       string;
  version:                  Version;
  descriptionHash:          string;
  pid:                      string;
  name:                     null | string;
  stakingToken:             string;
  stakingTokenDecimals:     string;
  stakingTokenSymbol:       string;
  honeyPotBalance:          string;
  totalRewardPaid:          string;
  committee:                string;
  allocPoints:              string[];
  master:                   { [key: string]: null | string };
  numberOfApprovedClaims:   string;
  rewardsLevels:            string[] | null;
  liquidityPool:            boolean;
  registered:               boolean;
  maxBounty:                null | string;
  userWithdrawRequest:      any[];
  withdrawRequests:         WithdrawRequest[];
  totalUsersShares:         string;
  hackerVestedRewardSplit:  string;
  hackerRewardSplit:        string;
  committeeRewardSplit:     string;
  swapAndBurnSplit:         string;
  governanceHatRewardSplit: string;
  hackerHatRewardSplit:     string;
  vestingDuration:          string;
  vestingPeriods:           string;
  depositPause:             boolean;
  committeeCheckedIn:       boolean;
  rewardControllers:        any[];
  activeClaim:              null;
}

export enum Version {
  V1 = "v1",
  V2 = "v2",
}

export interface WithdrawRequest {
  id:                 string;
  beneficiary:        string;
  withdrawEnableTime: string;
  createdAt:          string;
  expiryTime:         string;
}


// Project

export interface Project {
  id:                 string;
  version:            string;
  "project-metadata": ProjectMetadata;
  committee:          Committee;
  source:             Source;
  severities:         Severity[];
  scope:              Scope;
}

export interface Committee {
  chainId:            string;
  "multisig-address": string;
  members:            Member[];
}

export interface Member {
  name:                  string;
  address:               string;
  linkedMultisigAddress: string;
  "twitter-link":        string;
  "image-ipfs-link":     string;
  "pgp-keys":            PGPKey[];
}

export interface PGPKey {
  publicKey: string;
}

export interface ProjectMetadata {
  name:                      string;
  icon:                      string;
  tokenIcon:                 string;
  website:                   string;
  type:                      string;
  oneLiner:                  string;
  intendedCompetitionAmount: string;
  starttime:                 number;
  endtime:                   number;
  whitelist?:                 { address:string }[];
}

export interface Scope {
  reposInformation:          ReposInformation[];
  description:               string;
  codeLangs:                 string[];
  docsLink:                  string;
  outOfScope:                string;
  protocolSetupInstructions: ProtocolSetupInstructions;
}

export interface ProtocolSetupInstructions {
}

export interface ReposInformation {
  isMain:     boolean;
  url:        string;
  commitHash: string;
}

export interface Severity {
  id:                  string;
  decryptSubmissions:  boolean;
  name:                string;
  "contracts-covered": any[];
  "nft-metadata":      NftMetadata;
  description:         string;
  percentage:          string;
  capAmount:           string;
  contractsCoveredNew: any[];
}

export interface NftMetadata {
  name:          string;
  description:   string;
  animation_url: string;
  image:         string;
  external_url:  string;
}

export interface Source {
  name: string;
  url:  string;
}
