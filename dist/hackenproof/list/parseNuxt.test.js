import { it } from "vitest";
import { parseNuxtData } from "./parseNuxt.js";
it("parseNuxtData", () => {
    const data = require("../test/nuxt.json");
    const parsed = parseNuxtData(data);
    console.log(parsed);
});
//# sourceMappingURL=parseNuxt.test.js.map