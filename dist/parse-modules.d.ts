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
export declare const parseTreeModules: (scope: string[]) => string[];
