import { parseTreeModulesV2 } from "./parse-modules.js";
import { it, expect } from "vitest";
it("parses modules 1", () => {
    let input = `
contracts/
└── core/
    ├── ccip/
    │   ├── base/
    │   │   └── SDLPoolCCIPController.sol
    │   ├── RESDLTokenBridge.sol
    │   ├── SDLPoolCCIPControllerPrimary.sol
    │   ├── SDLPoolCCIPControllerSecondary.sol
    │   └── WrappedTokenBridge.sol
    └── sdlPool/
        ├── base/
        │   └── SDLPool.sol
        ├── LinearBoostController.sol
        ├── SDLPoolPrimary.sol
        └── SDLPoolSecondary.sol
    └── RewardsInitiator.sol`;
    let res = parseTreeModulesV2(input.split("\n"));
    expect(res).toEqual([
        "contracts/core/ccip/base/SDLPoolCCIPController.sol",
        "contracts/core/ccip/RESDLTokenBridge.sol",
        "contracts/core/ccip/SDLPoolCCIPControllerPrimary.sol",
        "contracts/core/ccip/SDLPoolCCIPControllerSecondary.sol",
        "contracts/core/ccip/WrappedTokenBridge.sol",
        "contracts/core/sdlPool/base/SDLPool.sol",
        "contracts/core/sdlPool/LinearBoostController.sol",
        "contracts/core/sdlPool/SDLPoolPrimary.sol",
        "contracts/core/sdlPool/SDLPoolSecondary.sol",
        "contracts/core/RewardsInitiator.sol",
    ]);
});
//# sourceMappingURL=parse-modules.test.js.map