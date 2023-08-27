export type SentryLevel = "error" | "warning" | "info" | "debug" | "fatal";
export type SentryInterval = "daily" | "hourly"

export type SentryErrorCallback = {
  (error: any, message?: string, interval?: SentryInterval): void
}

let sentryErrorCallback: SentryErrorCallback
export let setSentryErrorCallback = (callback: SentryErrorCallback) => {
  sentryErrorCallback = callback
}

export let sentryError = async (error: any, message?: string, interval?: SentryInterval) => {
  if (sentryErrorCallback) {
    sentryErrorCallback(error, message, interval)
  }
}

export const githubParams = {
  headers: {
    "Accept": "application/vnd.github+json",
  },
  auth: {
    username: "tonisives",
    password: `${process.env.ghpKey}`
  }
}