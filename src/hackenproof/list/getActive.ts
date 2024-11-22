import { pipe, T } from "ti-fptsu/lib"
import { CantinaContest } from "../types.js"
import { loadNuxtProps } from "../../web-load/load-next-props.js"

// prettier-ignore
export const getAllContests = async (): Promise<CantinaContest[]> =>
  loadNuxtProps("https://hackenproof.com/audit-programs/")
// pipe(
//   () => loadNuxtProps(),
//   T.map(parseNuxtData),
//   T.map(it => it)
// )()

export const getActiveContests = async () => {
  let allContests = await getAllContests()
  return allContests.filter((it) => it.status === "live" || it.status === "upcoming")
}

// this is some other info. it doesn't include the contest
// let loadNuxtProps = () =>
//   fetch("https://hackenproof.com/_payload.json?c386c6fd-88fb-4cd8-80a5-2fd10629e767", {
//     headers: {
//       accept: "*/*",
//       "accept-language": "en-US,en;q=0.8",
//       "cache-control": "no-cache",
//       pragma: "no-cache",
//       priority: "u=1, i",
//       "sec-ch-ua": '"Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
//       "sec-ch-ua-arch": '"arm"',
//       "sec-ch-ua-bitness": '"64"',
//       "sec-ch-ua-full-version-list":
//         '"Brave";v="131.0.0.0", "Chromium";v="131.0.0.0", "Not_A Brand";v="24.0.0.0"',
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-model": '""',
//       "sec-ch-ua-platform": '"macOS"',
//       "sec-ch-ua-platform-version": '"15.0.1"',
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "cors",
//       "sec-fetch-site": "same-origin",
//       "sec-gpc": "1",
//       Referer: "https://hackenproof.com/audit-programs/",
//       "Referrer-Policy": "strict-origin-when-cross-origin",
//     },
//     body: null,
//     method: "GET",
//   }).then((res) => res.json())

// function parseNuxtData(data: any[]) {
//   function resolveValue(value: any): any {
//     if (Array.isArray(value)) {
//       if (value[0] === "ShallowReactive") {
//         return resolveValue(value[1])
//       }
//       return value.map((item: any) => resolveValue(item))
//     }
//     if (typeof value === "object" && value !== null) {
//       const resolved: any = {}
//       for (const [key, val] of Object.entries(value)) {
//         resolved[key] = resolveValue(val)
//       }
//       return resolved
//     }
//     // If the value is a number and exists in the original data array
//     if (typeof value === "number" && data[value] !== undefined) {
//       return resolveValue(data[value])
//     }
//     return value
//   }

//   return resolveValue(data)
// }
