// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ICvgControlTower.sol";

interface ICvgAggregatorV3 {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);

    function initialize(ICvgControlTower _cvgControlTower, uint8 setDecimals, string memory setDescription) external;
}
