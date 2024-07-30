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
it("parses with tabs", () => {
    let input = "## Project overview\n\nThe contract implements stableswap invariant AMM based on Curve stableswap model. The contract implementation is extended to support tokens with rate oracles.\n\nThe smart contract is implemented in ink! smart contract language and adapted to work on Substrate platform.\n\n## Audit competition scope\n\n```\n|-- common-amm-stable-swap\n    |-- amm\n        |-- contracts\n            |-- stable_pool\n\t\t    |-- lib.rs\n\t\t    |-- token_rate.rs\n        |-- traits\n            |-- lib.rs\n\t\t|-- ownable2step.rs\n\t\t|-- stable_pool.rs\n\t\t|-- rate_provied.rs\n    |-- helpers\n        |-- stable_swap_math\n            |-- fees.rs\n\t\t|-- mod.rs\n        |-- constants.rs\n        |-- ensure.rs\n        |-- lib.rs\n        |-- math.rs\n```";
    let res = parseTreeModulesV2(input.split("\n"));
    expect(res).toEqual([
        "common-amm-stable-swap/amm/contracts/stable_pool/lib.rs",
        "common-amm-stable-swap/amm/contracts/stable_pool/token_rate.rs",
        "common-amm-stable-swap/amm/traits/lib.rs",
        "common-amm-stable-swap/amm/traits/ownable2step.rs",
        "common-amm-stable-swap/amm/traits/stable_pool.rs",
        "common-amm-stable-swap/amm/traits/rate_provied.rs",
        "common-amm-stable-swap/helpers/stable_swap_math/fees.rs",
        "common-amm-stable-swap/helpers/stable_swap_math/mod.rs",
        "common-amm-stable-swap/helpers/constants.rs",
        "common-amm-stable-swap/helpers/ensure.rs",
        "common-amm-stable-swap/helpers/lib.rs",
        "common-amm-stable-swap/helpers/math.rs",
    ]);
});
//# sourceMappingURL=parse-modules.test.js.map