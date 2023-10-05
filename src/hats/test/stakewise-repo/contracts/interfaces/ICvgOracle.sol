// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./IOracleStruct.sol";

interface ICvgOracle {
    function getPriceOracleUnverified(IERC20Metadata erc20) external view returns (uint256);

    function getEthPriceOracleUnverified() external view returns (uint256);

    function getCvgPriceOracleUnverified() external view returns (uint256);

    function getAndVerifyCvgPrice() external view returns (uint256);

    function getPriceAggregator(AggregatorV3Interface aggregator) external view returns (uint256, uint256);

    function oracleParametersPerERC20(IERC20Metadata erc20) external view returns (IOracleStruct.OracleParams memory);

    function getAndVerifyOracleAndAggregatorPrices(IERC20Metadata erc20) external view returns (uint256);

    function getAndVerifyOracleAndAggregatorTwoPrices(
        IERC20Metadata tokenIn,
        IERC20Metadata tokenOut
    ) external view returns (uint256, uint256);

    function getOracleAndAggregatorPrices(
        IERC20Metadata erc20Address
    ) external view returns (uint256, uint256, bool, bool, bool, bool);
}
