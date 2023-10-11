import Logger from "js-logger";
export const githubParams = {
    method: "GET",
    headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "token " + process.env.GITHUB_ACCESS_TOKEN
    }
};
export const setLogLevel = (level) => {
    Logger.useDefaults({
        defaultLevel: level
    });
};
//# sourceMappingURL=config.js.map