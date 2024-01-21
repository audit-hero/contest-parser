/**
 *
all of these options should work
```js
contracts
├── interfaces
    ├── oracles
        ├── IChainlinkOracle.sol
        ├── IGMXOracle.sol
|   ├── strategy
        ├── gmx
|   |-      ├── IGMXVault.sol
            ├── IGMXVaultEvent.sol
├── oracles
        ├── ChainlinkARBOracle.sol
  _     ├── GMXOracle.sol
```
 */
export declare const parseTreeModulesOld: (scope: string[]) => string[];
export declare let parseTreeModulesV2: (lines: string[]) => string[];
