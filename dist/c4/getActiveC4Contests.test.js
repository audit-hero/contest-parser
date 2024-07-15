import { expect, it, vi } from "vitest";
import { getActiveC4Contests } from "./getActiveC4Contests.js";
import fs from "fs";
import { pipe } from "fp-ts/lib/function.js";
import * as TE from "fp-ts/lib/TaskEither.js";
it("should get active c4 contests", async () => {
    vi.mock("../util.js", () => ({
        getHtmlAsMd: async () => fs.readFileSync(`./src/c4/test/md/2024-07-28-from-md.md`).toString(),
    }));
    await pipe(() => getActiveC4Contests(), TE.mapBoth((err) => expect(err).toBe(null), (it) => expect(it.length).toBe(7)))();
    vi.clearAllMocks();
});
//# sourceMappingURL=getActiveC4Contests.test.js.map