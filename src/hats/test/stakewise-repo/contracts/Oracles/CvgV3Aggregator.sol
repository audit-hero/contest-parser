// SPDX-License-Identifier: MIT
/**
 _____
/  __ \
| /  \/ ___  _ ____   _____ _ __ __ _  ___ _ __   ___ ___
| |    / _ \| '_ \ \ / / _ \ '__/ _` |/ _ \ '_ \ / __/ _ \
| \__/\ (_) | | | \ V /  __/ | | (_| |  __/ | | | (_|  __/
 \____/\___/|_| |_|\_/ \___|_|  \__, |\___|_| |_|\___\___|
                                 __/ |
                                |___/
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "../interfaces/ICvgControlTower.sol";

contract CvgV3Aggregator is Ownable2Step, Initializable {
    uint8 public decimals;
    string public description;
    int256 public latestPrice;
    uint256 public lastUpdate;

    event SetLatestPrice(int256 newPrice, uint256 timestamp);

    constructor() {
        _disableInitializers();
    }

    /**
     *  @notice Initialize function of the AggregatorContract, can only be called once (by the clone factory)
     *  @param _cvgControlTower address of the control tower
     *  @param setDecimals uint8
     *  @param setDescription string
     */
    function initialize(
        ICvgControlTower _cvgControlTower,
        uint8 setDecimals,
        string memory setDescription
    ) external initializer {
        decimals = setDecimals;
        description = setDescription;

        /// @dev Need to transfer ownership on initialize as cloned contract don't go through constructor
        _transferOwnership(_cvgControlTower.treasuryDao());
    }

    function setLatestPrice(int256 _newPrice) external onlyOwner {
        latestPrice = _newPrice;
        lastUpdate = block.timestamp;
        emit SetLatestPrice(_newPrice, block.timestamp);
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (0, latestPrice, 0, lastUpdate, 0);
    }
}
