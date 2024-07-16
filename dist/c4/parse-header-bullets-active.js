import { NO_START_END } from "../errors.js";
import { getAnyDateUTCTimestamp } from "../util.js";
import { getHmAwards } from "./parse-utils.js";
import { E, O, pipe } from "ti-fptsu/lib";
export let parseBulletsActive = (md) => {
    let bullets = getHeaderBullets(md);
    return pipe(getStartEndTime(bullets), E.map((it) => ({
        prize: getHmAwards(bullets),
        ...it,
        readme: "",
    })));
};
let getStartEndTime = (bullets) => pipe(O.Do, O.apS("start_date", getTimeFromBullets(bullets, "Starts")), O.apS("end_date", getTimeFromBullets(bullets, "Ends")), E.fromOption(() => new Error(NO_START_END)));
export let getTimeFromBullets = (bullets, prefix) => pipe(O.fromNullable(bullets
    .reverse()
    .find((it) => it.includes(prefix))
    ?.split(prefix)[1]
    .trim()), O.chain((it) => O.fromNullable(getAnyDateUTCTimestamp(it))));
export let getHeaderBullets = (md) => {
    let split = md.split("\n");
    let firstBullet = split.findIndex((it) => it.trim().startsWith("*"));
    let lastBullet = split.slice(firstBullet).findIndex((it) => !it.trim().startsWith("*"));
    return split.slice(firstBullet, firstBullet + lastBullet);
};
export let usdCoins = ["USDC", "USDT", "DAI", "TUSD", "BUSD", "USDP", "UST"];
export let trimContestAmount = (amount) => {
    amount = amount.replace("$$", "$").replace(" in ", " ");
    if (usdCoins.some((it) => amount.includes(it))) {
        amount = amount.replace("$", "").replace(" ", "");
        usdCoins.forEach((it) => {
            amount = amount.replace(it, "");
        });
        amount = amount + " $";
    }
    return amount;
};
//# sourceMappingURL=parse-header-bullets-active.js.map