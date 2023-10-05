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

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "../interfaces/ICrvPool.sol";
import "../interfaces/IOracleStruct.sol";
import "../interfaces/ICvgAggregatorV3.sol";

import "../libs/TickMath.sol";

contract CvgOracle is Ownable2Step {
    //poolType 0 - UniswapV3 pool
    //poolType 1 - UniswapV2 pool
    //poolType 2 - Curve pool

    /// @dev Tokens WL into oracle
    mapping(IERC20Metadata => IOracleStruct.OracleParams) public oracleParametersPerERC20;

    IERC20Metadata constant WETH = IERC20Metadata(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    IERC20Metadata public cvg;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            CONSTRUCTOR
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    constructor(address treasuryDao) {
        /// @dev Transfer ownership to multisig
        _transferOwnership(treasuryDao);
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            PUBLICS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    /**
     *  @notice Compute the price of a UNISWAP or Curve pool
     *  @param erc20Address erc20 address
     */
    function getPriceOracle(IERC20Metadata erc20Address) external view returns (uint256, bool) {
        return _getPriceOracle(erc20Address);
    }

    /**
     *  @notice Compute the price of a UNISWAP or Curve pool
     *  @param erc20Address erc20 address
     */
    function _getPriceOracle(IERC20Metadata erc20Address) internal view returns (uint256, bool) {
        IOracleStruct.OracleParams memory oracleParams = oracleParametersPerERC20[erc20Address];
        uint256 poolType = oracleParams.poolType;
        if (poolType == 0) {
            return
                _getV3Price(
                    oracleParams.poolAddress,
                    oracleParams.twapInterval,
                    oracleParams.isReversed,
                    oracleParams.isEthPriceRelated
                );
        } else if (poolType == 1) {
            return _getV2Price(oracleParams.poolAddress, oracleParams.isReversed, oracleParams.isEthPriceRelated);
        } else if (poolType == 2) {
            return _getCrvPoolPrice(oracleParams.poolAddress, oracleParams.isReversed, oracleParams.isEthPriceRelated);
        } else {
            return _getCrvPoolTricrypto(oracleParams.poolAddress, oracleParams.isReversed ? 0 : 1);
        }
    }

    /**
     *  @notice Compute the Time Weighted Average Price IN WEI
     *  @param uniswapV3Pool address
     *  @param twapInterval uint32
     *  @param isReversed bool
     *  @param isEthPriceRelated bool
     */
    function _getV3Price(
        address uniswapV3Pool,
        uint32 twapInterval,
        bool isReversed,
        bool isEthPriceRelated
    ) internal view returns (uint256, bool) {
        uint256 price;
        if (twapInterval == 0) {
            // return the current price if twapInterval == 0
            (price, , , , , , ) = IUniswapV3Pool(uniswapV3Pool).slot0();
        } else {
            uint32[] memory secondsAgos = new uint32[](2);
            secondsAgos[0] = twapInterval; // from (before)
            secondsAgos[1] = 0; // to (now)

            (int56[] memory tickCumulatives, ) = IUniswapV3Pool(uniswapV3Pool).observe(secondsAgos);

            // tick(imprecise as it's an integer) to price
            price = TickMath.getSqrtRatioAtTick(
                int24((tickCumulatives[1] - tickCumulatives[0]) / int56(int32(twapInterval)))
            );
        }
        price = (price * price) / FixedPoint96.Q96;
        price = (price * 10 ** _getDecimalsDelta(uniswapV3Pool)) / FixedPoint96.Q96;
        return _postTreatmentAndVerifyEth(price, isReversed, isEthPriceRelated);
    }

    /**
     *  @notice Compute the Time Weighted Average Price in wei
     *  @param uniswapV2Pool Address of the Uniswap V2 Pool
     *  @param isReversed bool
     *  @param isEthPriceRelated bool
     */
    function _getV2Price(
        address uniswapV2Pool,
        bool isReversed,
        bool isEthPriceRelated
    ) internal view returns (uint256, bool) {
        (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(uniswapV2Pool).getReserves();
        uint256 price = reserve0 < reserve1
            ? (reserve1 * 10 ** _getDecimalsDelta(uniswapV2Pool)) / reserve0
            : (reserve0 * 10 ** _getDecimalsDelta(uniswapV2Pool)) / reserve1;
        return _postTreatmentAndVerifyEth(price, isReversed, isEthPriceRelated);
    }

    /**
     *  @notice Compute the Time Weighted Average Price in wei
     *  @param crvPool Address of the Curve Pool
     *  @param isReversed bool
     *  @param isEthPriceRelated bool
     */
    function _getCrvPoolPrice(
        address crvPool,
        bool isReversed,
        bool isEthPriceRelated
    ) internal view returns (uint256, bool) {
        return _postTreatmentAndVerifyEth(ICrvPool(crvPool).last_prices(), isReversed, isEthPriceRelated);
    }

    /**
     *  @notice Compute the Time Weighted Average Price in wei
     *  @param crvPool Address of the Curve Pool
     *  @param k token index
     */
    function _getCrvPoolTricrypto(address crvPool, uint256 k) internal view returns (uint256, bool) {
        return _postTreatmentAndVerifyEth(ICrvPool(crvPool).last_prices(k), false, false);
    }

    /**
     *  @notice Post Treatment of a given price pool to align all prices on 18 decimals
     *  @param price of the pool
     *  @param isReversed bool
     *  @param isEthPriceRelated bool
     */
    function _postTreatmentAndVerifyEth(
        uint256 price,
        bool isReversed,
        bool isEthPriceRelated
    ) internal view returns (uint256, bool) {
        bool isEthVerified = true;

        if (isReversed) {
            price = 10 ** 36 / price;
        }
        if (isEthPriceRelated) {
            (
                uint256 ethPrice,
                ,
                bool isOracleNotToLow,
                bool isOracleNotToHigh,
                ,
                bool isStalePrice
            ) = _getOracleAndAggregatorPrices(WETH);
            isEthVerified = isOracleNotToLow && isOracleNotToHigh && isStalePrice;
            price = (price * ethPrice) / 10 ** 18;
        }

        return (price, isEthVerified);
    }

    /**
     *  @notice Get the token price from the Chainlink aggregator
     *  @return aggregator AggregatorV3Interface
     */
    function getPriceAggregator(AggregatorV3Interface aggregator) external view returns (uint256, uint256) {
        return _getPriceAggregator(aggregator);
    }

    /**
     *  @notice Get the token price from the Chainlink aggregator
     *  @return aggregator AggregatorV3Interface
     */
    function _getPriceAggregator(AggregatorV3Interface aggregator) internal view returns (uint256, uint256) {
        (, int256 chainlinkPrice, , uint256 lastUpdate, ) = aggregator.latestRoundData();
        return (uint256(chainlinkPrice) * 10 ** (18 - aggregator.decimals()), lastUpdate);
    }

    /**
     *  @notice Compute delta decimals that allow us to normalize the oracle to 18 decimals
     *  @param uniswapPool address
     */
    function _getDecimalsDelta(address uniswapPool) internal view returns (uint256 decimalsDelta) {
        uint256 token0Decimals = IERC20Metadata(IUniswapV3Pool(uniswapPool).token0()).decimals();
        uint256 token1Decimals = IERC20Metadata(IUniswapV3Pool(uniswapPool).token1()).decimals();
        decimalsDelta = token0Decimals <= token1Decimals
            ? 18 - (token1Decimals - token0Decimals)
            : 18 - (token0Decimals - token1Decimals);
    }

    /// @notice Compute the ETH price based on the associated LP
    function getEthPriceOracleUnverified() external view returns (uint256 price) {
        (price, ) = _getPriceOracle(WETH);
    }

    /// @notice Compute the CVG price based on the associated LP
    function getCvgPriceOracleUnverified() external view returns (uint256 price) {
        (price, ) = _getPriceOracle(cvg);
    }

    /// @notice Compute the CVG price based on the associated LP
    function getPriceOracleUnverified(IERC20Metadata erc20) external view returns (uint256 price) {
        (price, ) = _getPriceOracle(erc20);
    }

    /**
     *  @notice double security, compare the price computed through pool with Aggregator oracle
     */
    function getOracleAndAggregatorPrices(
        IERC20Metadata erc20Address
    ) external view returns (uint256, uint256, bool, bool, bool, bool) {
        return _getOracleAndAggregatorPrices(erc20Address);
    }

    /**
     *  @notice double security, compare the price computed through pool with Aggregator oracle
     */
    function getAndVerifyCvgPrice() external view returns (uint256) {
        return _getAndVerifyOracleAndAggregatorPrices(cvg);
    }

    /**
     *  @notice double security, compare the price computed through pool with Chainlink oracle
     *  @param erc20Address address of the token we want to fetch the price
     */
    function _getOracleAndAggregatorPrices(
        IERC20Metadata erc20Address
    ) internal view returns (uint256, uint256, bool, bool, bool, bool) {
        /// @dev Fetch price through CvgOracle
        IOracleStruct.OracleParams memory oracleParams = oracleParametersPerERC20[erc20Address];
        (uint256 poolOraclePrice, bool isEthVerified) = oracleParams.isStable
            ? (10 ** 18, true)
            : _getPriceOracle(erc20Address);
        (uint256 aggregatorOraclePrice, uint256 lastUpdateDate) = _getPriceAggregator(oracleParams.aggregatorOracle);
        uint256 delta = (oracleParams.deltaAggregatorCvgOracle * poolOraclePrice) / 10_000;

        return (
            poolOraclePrice,
            aggregatorOraclePrice,
            poolOraclePrice + delta > aggregatorOraclePrice,
            poolOraclePrice - delta < aggregatorOraclePrice,
            isEthVerified,
            lastUpdateDate + oracleParams.maxLastUpdateAggregator > block.timestamp
        );
    }

    /**
     *  @notice double security, compare the price computed through pool with Chainlink oracle
     *  @param erc20Address address of the token we want to fetch the price
     */
    function _getAndVerifyOracleAndAggregatorPrices(IERC20Metadata erc20Address) internal view returns (uint256) {
        /// @dev Fetch price through CvgOracle
        IOracleStruct.OracleParams memory oracleParams = oracleParametersPerERC20[erc20Address];
        (uint256 poolOraclePrice, bool isEthVerified) = oracleParams.isStable
            ? (10 ** 18, true)
            : _getPriceOracle(erc20Address);
        (uint256 aggregatorOraclePrice, uint256 lastUpdateDate) = _getPriceAggregator(oracleParams.aggregatorOracle);
        uint256 delta = (oracleParams.deltaAggregatorCvgOracle * poolOraclePrice) / 10_000;

        require(poolOraclePrice + delta > aggregatorOraclePrice, "ORACLE_TO_LOW");
        require(poolOraclePrice - delta < aggregatorOraclePrice, "ORACLE_TO_HIGH");
        require(isEthVerified, "ETH_NOT_VERIFIED");
        require(lastUpdateDate + oracleParams.maxLastUpdateAggregator > block.timestamp, "STALE_AGGREGATOR");
        return poolOraclePrice;
    }

    /**
     *  @notice double security, compare the price computed through pool with Chainlink oracle
     *  @param erc20Address address of the token we want to fetch the price
     */
    function getAndVerifyOracleAndAggregatorPrices(IERC20Metadata erc20Address) external view returns (uint256) {
        return _getAndVerifyOracleAndAggregatorPrices(erc20Address);
    }

    /**
     *  @notice double security, compare the price computed through pool with Chainlink oracle
     *  @param tokenIn address of the token we want to fetch the price
     *  @param tokenOut address of the token we want to fetch the price
     */
    function getAndVerifyOracleAndAggregatorTwoPrices(
        IERC20Metadata tokenIn,
        IERC20Metadata tokenOut
    ) external view returns (uint256, uint256) {
        return (_getAndVerifyOracleAndAggregatorPrices(tokenIn), _getAndVerifyOracleAndAggregatorPrices(tokenOut));
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            ONLYOWNER
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    /**
     *  @notice Set the Oracle params of a token
     *  @param erc20Address address of the token we want to fetch the price
     */
    function setTokenOracleParams(
        IERC20Metadata erc20Address,
        IOracleStruct.OracleParams memory tokenOracleParams
    ) external onlyOwner {
        oracleParametersPerERC20[erc20Address] = tokenOracleParams;
    }

    /**
     *  @notice Set CVG token address
     *  @param _cvg address of the cvg token
     */
    function setCvgToken(IERC20Metadata _cvg) external onlyOwner {
        cvg = _cvg;
    }
}
