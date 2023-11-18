import { vi, it, expect, afterEach } from "vitest"
import { getActiveCantinaContests, getActiveContests } from "./getActive.js"

let websiteAsMd = `[How it works](/welcome#how-it-works)[Services](/welcome#services)[FAQ](/welcome#faq)[Competitions](/competitions)\n\n[Sign in](/login)\n\n[How it works](/welcome#how-it-works)[Services](/welcome#services)[FAQ](/welcome#faq)[Competitions](/competitions)[Sign in](/login)\n\n1. Competitions\n\nLive\n\n![Competition cover](/_next/static/media/CoverImagePlaceholder.d81b9d68.svg)\n\n### Morpho - morpho-blue\n\nLive\n\n# Morpho Blue Competition\n\nMorpho Labs has teamed up with Cantina for the inaugural public security review competition hosted on their new platform by security researchers for security researchers. The competition will run two codebases in parallel: Metamo\n\n$100,000 USDC\n\n13 Nov 2023 - 3 Dec 2023\n\n[View competition](/competitions/d86b7f95-e574-4092-8ea2-78dcac2f54f1)\n\n![Competition cover](/_next/static/media/CoverImagePlaceholder.d81b9d68.svg)\n\n### Morpho - metamorpho-and-periphery\n\nLive\n\n# Metamorpho and Periphery Competition\n\nMorpho Labs has teamed up with Cantina for the inaugural public security review competition hosted on their new platform by security researchers for security researchers.\n\nThe competition at a glance:\n\n* November 16t\n\n$100,000 USDC\n\n16 Nov 2023 - 7 Dec 2023\n\n[View competition](/competitions/8409a0ce-6c21-4cc9-8ef2-bd77ce7425af)\n\n© 2023 Cantina. All rights reserved`


it("parses", () => {
  let contests = getActiveContests(websiteAsMd)

  expect(contests.length).toBe(2)
  expect(contests[1].prize).toBe("$100,000 USDC")
})
