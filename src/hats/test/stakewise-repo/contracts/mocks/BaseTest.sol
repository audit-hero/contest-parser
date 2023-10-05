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

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "../interfaces/ICvgControlTower.sol";

contract BaseTest is Initializable, Ownable2Step {
    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            PACKAGING
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    ICvgControlTower public cvgControlTower;
    uint256 public counter;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            INITIALIZE
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    constructor() {
        _disableInitializers();
    }

    /**
     *  @notice Initialize function of the bond contract, can only be called once (by the clone factory)
     *  @param _cvgControlTower address
     */
    function initialize(ICvgControlTower _cvgControlTower) external initializer {
        /// @dev Need to transfer ownership on initialize as cloned contract don't go through constructor
        _transferOwnership(_cvgControlTower.treasuryDao());
    }

    function incrementCounter() external onlyOwner {
        counter++;
    }
}
