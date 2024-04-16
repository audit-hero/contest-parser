import { Logger, LogLevel } from "jst-logger"

export const githubParams = {
  method: "GET",
  headers: {
    "Accept": "application/vnd.github+json",
    "Authorization": "token " + process.env.GITHUB_ACCESS_TOKEN!
  }
}

export const setLogLevel = (level: LogLevel) => {
  Logger.setLevel(level)
}