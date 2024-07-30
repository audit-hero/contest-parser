## Crypto audit contest parser/aggregator

Parses audit information from popular platforms into a single JSON format.

Supported platforms: C4, Sherlock, Hats, CodeHawks, ImmuneFi, Cantina

## Add to your existing esm project

- `yarn add 'contest-parser@audit-hero/contest-parser'`
    - specific commit: append `#commit={hash}'`

- add Github API access token to env

```
export GITHUB_ACCESS_TOKEN="token"
```

```typescript
import { getActiveC4Contests } from "contest-parser"

let c4Contests = await getActiveC4Contests()
```

## Build and test locally

- `export NODE_OPTIONS=--experimental-vm-modules`
- `yarn && yarn test`

## Add a new contest parser

Check out ./codehawks or /hats folder for a reference implementation. In the end, the parser should
return an array of `ContestWithModules`:

```typescript
export type Contest = {
  pk: string
  sk: string
  url: string
  start_date: number
  end_date: number
  // = end_date > current_date (can be created but not running)
  active: number
  status: Status
  prize: string // could be eth or usd
  platform: Platform
  tags: Tag[]
  repo_urls?: string[]
  doc_urls?: string[]
  em_stored?: number
  analyze_result?: {
    total_nsloc: number
  }
}

export type ContestWithModules = Contest & {
  modules: ContestModule[]
  auditTime?: number
  loc?: number
}

export type ContestModule = {
  name: string
  contest: string
  active: number
  // approximate audit time in seconds
  auditTime?: number
  link_in_md?: string
  url?: string
  path?: string
  loc?: number
}
```

Please make a pull request with a new parser or bugfixes to current ones.
