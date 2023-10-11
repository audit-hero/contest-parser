import Logger, { ILogLevel } from "js-logger"

export const githubParams = {
  method: "GET",
  headers: {
    "Accept": "application/vnd.github+json",
    "Authorization": "token " + process.env.GITHUB_ACCESS_TOKEN!
  }
}

export const setLogLevel = (level: ILogLevel) => {
  Logger.useDefaults({
    defaultLevel: level
  })
}