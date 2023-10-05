// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "./IERC20Mintable.sol";
import "./ICvg.sol";
import "./IBondCalculator.sol";
import "./ICvgOracle.sol";

interface ICvgControlTower {
    function cvgToken() external view returns (ICvg);

    function cvgOracle() external view returns (ICvgOracle);

    function bondCalculator() external view returns (IBondCalculator);

    function allBaseAggregators(uint256 index) external view returns (address);

    function treasuryDao() external view returns (address);

    function treasuryStaking() external view returns (address);

    function treasuryBonds() external view returns (address);

    function insertNewAggregator(address _newClone, uint256 _version) external;
}
