import { newPage } from "../../web-load/playwright-loader.js"
import { CantinaContest } from "../types.js"

export const getAllContests = async (): Promise<CantinaContest[]> => {
  let competitions = await getCompetitions()
  return competitions
}

let getCompetitions = async () => {
  let page = await newPage()

  await page.goto("https://cantina.xyz/competitions", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  })

  let nextData = await page.evaluate(async () => {
    let props = JSON.parse(
      document.querySelector("#__NEXT_DATA__")?.textContent ?? ""
    )

    return props
  })

  let competitions = nextData.props.pageProps.competitions as CantinaContest[]
  // page.close()
  
  return competitions
}

export const getActiveContests = async () => {
  let allContests = await getAllContests()
  return allContests.filter((it) => it.status === "live")
}
