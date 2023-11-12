import { docHeadings, findDocUrl, findTags, getContestStatus } from "../util";
import Logger from "js-logger";
import { sentryError } from "ah-shared";
import { getModules } from "./hats-parser.modules.js";
export const parseActiveHatsContests = async (existingContests) => {
    let active = await getActiveContests();
    let contests = await parseContests(active, existingContests);
    return contests.filter(it => it !== undefined);
};
export const getActiveContests = async () => {
    let allProjects = await getAllProjects();
    let projectJobs = allProjects.data.vaults.map(it => {
        return getProject(it.descriptionHash, it.id);
    });
    let rawProjects = await Promise.all(projectJobs);
    let activeProjects = filterProjectActiveOrInFuture(rawProjects);
    return activeProjects;
};
const filterProjectActiveOrInFuture = (projets) => {
    return projets.filter(it => {
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
const getProject = async (descriptionHash, id) => {
    let project = await fetch(`https://ipfs2.hats.finance/ipfs/${descriptionHash}`)
        .then(async (it) => {
        if (!it.ok)
            return undefined;
        return await it.json();
    });
    return { ...project, id: id };
};
const getAllProjects = async () => {
    let projects = await fetch("https://api.thegraph.com/subgraphs/name/hats-finance/hats", {
        method: "POST",
        body: "{\"query\":\"\\n  query getVaults($account: String) {\\n    masters(first: 1000) {\\n      address\\n      governance\\n      numberOfSubmittedClaims\\n      withdrawPeriod\\n      safetyPeriod\\n      withdrawRequestEnablePeriod\\n      withdrawRequestPendingPeriod\\n      vestingHatDuration\\n      vestingHatPeriods\\n      defaultHackerHatRewardSplit\\n      defaultGovernanceHatRewardSplit\\n    }\\n    userNfts: nftowners(where: { address: $account }) {\\n      id\\n      balance\\n      nft {\\n        id\\n        tokenURI\\n        tokenId\\n        nftMaster\\n      }\\n    }\\n    vaults(first: 1000) {\\n      id\\n      version\\n      descriptionHash\\n      pid\\n      name\\n      stakingToken\\n      stakingTokenDecimals\\n      stakingTokenSymbol\\n      honeyPotBalance\\n      totalRewardPaid\\n      committee\\n      allocPoints\\n      master {\\n        address\\n        numberOfSubmittedClaims\\n        withdrawPeriod\\n        safetyPeriod\\n        withdrawRequestEnablePeriod\\n        withdrawRequestPendingPeriod\\n        vestingHatDuration\\n        vestingHatPeriods\\n        defaultHackerHatRewardSplit\\n        defaultGovernanceHatRewardSplit\\n        timelock: governance\\n      }\\n      numberOfApprovedClaims\\n      rewardsLevels\\n      liquidityPool\\n      registered\\n      maxBounty\\n      userWithdrawRequest: withdrawRequests( where: { beneficiary: $account }) {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      withdrawRequests {\\n        id\\n        beneficiary\\n        withdrawEnableTime\\n        createdAt\\n        expiryTime\\n      }\\n      totalUsersShares\\n      descriptionHash\\n      hackerVestedRewardSplit\\n      hackerRewardSplit\\n      committeeRewardSplit\\n      swapAndBurnSplit\\n      governanceHatRewardSplit\\n      hackerHatRewardSplit\\n      vestingDuration\\n      vestingPeriods\\n      depositPause\\n      committeeCheckedIn\\n      rewardControllers {\\n        id\\n        rewardToken\\n        rewardTokenSymbol\\n        rewardTokenDecimals\\n        totalRewardPaid\\n      }\\n      activeClaim {\\n        id\\n        claim\\n      }\\n    }\\n    payouts: claims(first: 1000) {\\n      id\\n      vault {\\n        id\\n      }\\n      payoutDataHash: claim\\n      beneficiary: claimer\\n      approvedAt\\n      dismissedAt\\n      bountyPercentage\\n      severityIndex: severity\\n      hackerReward\\n      hackerVestedReward\\n      governanceHatReward\\n      hackerHatReward\\n      committeeReward\\n      isChallenged\\n    }\\n  }\\n\",\"variables\":{}}"
    })
        .then(async (it) => await it.json());
    return projects;
};
let hatsNameToContestName = (project) => {
    let starttime = project.starttime;
    let month = `${new Date(starttime * 1000).getMonth() + 1}`;
    if (parseInt(month) < 10)
        month = `0${month}`;
    let year = new Date(starttime * 1000).getFullYear();
    let name = `${year}-${month}-${project.name.toLowerCase().replaceAll(" ", "-").replaceAll("--", "-").replaceAll("--", "-")}`;
    return name;
};
export const parseContests = async (contests, existingContests) => {
    let jobs = [];
    for (let i = 0; i < contests.length; ++i) {
        let name = hatsNameToContestName(contests[i]["project-metadata"]);
        let contestExists = existingContests.find(it => it.pk === name);
        if (contestExists && contestExists.modules.length > 0) {
            Logger.info(`contest ${name} already exists, skipping`);
            continue;
        }
        let contest = await parseContest(contests[i], name)
            .then(it => {
            if (!it.ok) {
                sentryError(it.error, `failed to parse sherlock contest ${name}`, "daily");
                return undefined;
            }
            return it.value;
        }).catch(e => {
            sentryError(e, `failed to parse sherlock contest ${name}`, "daily");
            return undefined;
        });
        jobs.push(contest);
    }
    return jobs;
};
const parseContest = async (contest, name) => {
    let { startDate, endDate } = getStartEndDate(contest);
    let dateError = getDatesError(startDate, endDate, name);
    let inFuture = startDate > Date.now() / 1000;
    if (dateError)
        return { ok: false, error: dateError.error };
    let hmAwards = contest["project-metadata"].intendedCompetitionAmount.replace("$", "").replace(",", "").replace(".", "");
    let docUrls = [];
    let modules = [];
    if (!inFuture) {
        if (contest.scope.docsLink)
            docUrls = [...findDocUrl(contest.scope.docsLink, docHeadings)];
        modules = await getModules(contest, name);
    }
    let tags = findTags(contest["project-metadata"].oneLiner.split("\n"));
    let baseUrl = "https://app.hats.finance/audit-competitions";
    let url = `${baseUrl}/${contest["project-metadata"].name.toLowerCase()}-${contest.id}`;
    if (url.includes(" "))
        url = url = baseUrl;
    let result = {
        pk: name,
        sk: "0",
        readme: getReadme(contest),
        url: url,
        start_date: startDate,
        end_date: endDate,
        platform: "hats",
        active: 1,
        status: getContestStatus({ startDate, endDate }),
        prize: hmAwards,
        modules: modules,
        doc_urls: docUrls,
        repo_urls: contest.scope.reposInformation.map(it => it.url),
        tags: tags
    };
    return { ok: true, value: result };
};
const getReadme = (contest) => {
    let oneLiner = contest["project-metadata"].oneLiner;
    let description = contest.scope.description;
    let docsLink = contest.scope.docsLink;
    let outOfScope = contest.scope.outOfScope;
    let instructions = contest.scope.protocolSetupInstructions.instructions;
    let oneLinerTitle = oneLiner ? `${oneLiner}` : ``;
    let descriptionTitle = description ? `## Description\n\n${description}` : ``;
    let docsLinkTitle = docsLink ? `## Docs\n\n${docsLink}` : ``;
    let outOfScopeTitle = outOfScope ? `## Out of Scope\n\n${outOfScope}` : ``;
    let instructionsTitle = instructions ? `## Instructions\n\n${instructions}` : ``;
    let all = [oneLinerTitle, descriptionTitle, docsLinkTitle, outOfScopeTitle, instructionsTitle];
    return all.filter(it => it !== "").join("\n\n");
};
export const getDatesError = (startDate, endDate, name) => {
    if (endDate < Date.now() / 1000) {
        return {
            error: `contest ${name} has already ended`
        };
    }
    /* if (startDate > Date.now() / 1000) {
      return {
        error: `contest ${name} hasn't started yet`
      }
    } */
};
function getStartEndDate(contest) {
    let startTime = contest["project-metadata"].starttime;
    let endTime = contest["project-metadata"].endtime;
    return { startDate: startTime, endDate: endTime };
}
//# sourceMappingURL=hats-parser.js.map