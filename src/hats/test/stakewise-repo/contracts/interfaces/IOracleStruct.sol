// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IOracleStruct {
    struct OracleParams {
        bool isStable;
        bool isReversed;
        bool isEthPriceRelated;
        uint32 twapInterval;
        uint40 poolType;
        address poolAddress;
        uint48 deltaAggregatorCvgOracle; // 5 % => 500 & 100 % => 10 000
        uint48 maxLastUpdateAggregator; // Buffer time before a not updated price is considered as stale
        AggregatorV3Interface aggregatorOracle;
    }
}
