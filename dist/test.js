"use strict";
let input = `contracts/
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
let res = parseDirectoryStructure(input);
console.log(res);
//# sourceMappingURL=test.js.map