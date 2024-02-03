import {
  Input,
  cryptoIgnoreGlobs,
  cryptoIncludeGlobs,
  getGitFilePaths,
} from "./getGitFilePaths.js"

/*
export type Input = {
  url: string
  includeGlobs: string[]
  ignoreGlobs?: string[]
}
*/
let sample = `'{"url":"https://github.com/blast-io/blast/", "includeGlobs": ${JSON.stringify(
  cryptoIncludeGlobs
)}}', "ignoreGlobs": ${JSON.stringify(cryptoIgnoreGlobs)}}'`

let input: Input = {} as any
try {
  input = JSON.parse(process.argv[2]) as Input
} catch (e) {console.log(e)}

if (!input.url) {
  console.error(`url is required\n\n${sample}`)
  process.exit(1)
}

if (!input.includeGlobs) {
  console.log(`Use the default globs?\n\n${sample}`)
  // ask user for input
  let response = await new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim())
    })
  })

  if (response === "y") {
    input.includeGlobs = cryptoIncludeGlobs
    input.ignoreGlobs = cryptoIgnoreGlobs
  } else {
    console.error(`includeGlobs is required\n\n${sample}`)
    process.exit(1)
  }
}

input.ignoreGlobs = input.ignoreGlobs || []

let paths = await getGitFilePaths(input)

console.log(JSON.stringify(paths, null, 2))
console.log(`\n\n${paths.length} files found`)
