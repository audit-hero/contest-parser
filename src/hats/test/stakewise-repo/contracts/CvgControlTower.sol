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

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "./interfaces/ICvgControlTower.sol";

contract CvgControlTower is Ownable2StepUpgradeable, ICvgControlTower {
    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                    GLOBAL PARAMETERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    uint128 public cvgCycle;
    ICvgOracle public cvgOracle;
    ICvg public cvgToken;
    address public cloneFactory;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                    BONDS GLOBAL PARAMETERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    IBondCalculator public bondCalculator;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                    AGGREGATORS GLOBAL PARAMETERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    address[] public allBaseAggregators; /// All base aggregator contracts
    mapping(address => address[]) public aggregatorClones; /// base aggregator => Clones linked to this version

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                   WALLETS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    address public treasuryBonds;
    address public treasuryStaking;
    address public treasuryDao;

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                   VESTING
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    address public vestingCvg;

    event NewCycle(uint256 cvgCycleId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _treasuryBonds, address _treasuryStaking, address _treasuryDao) external initializer {
        treasuryBonds = _treasuryBonds;
        treasuryStaking = _treasuryStaking;
        treasuryDao = _treasuryDao;
        cvgCycle = 1;
        _transferOwnership(_treasuryDao);
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        CLONE FACTORY FUNCTIONS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    function insertNewAggregator(address _newClone, uint256 _version) external {
        require(msg.sender == cloneFactory, "CLONE_FACTORY");
        aggregatorClones[allBaseAggregators[_version - 1]].push(_newClone);
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        INTERNAL FUNCTIONS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    /// Pagination pattern in order to don't run out of gaz if an array is to big
    /// Chunk the original array
    /// @param _fullArray - full array address to be splitted
    /// @param _cursorStart    - index of the array to be the first item of the returned array
    /// @param _lengthDesired - max length of the returned array
    function _paginate(
        address[] memory _fullArray,
        uint256 _cursorStart,
        uint256 _lengthDesired
    ) internal pure returns (address[] memory) {
        uint256 _totalArrayLength = _fullArray.length;

        if (_cursorStart + _lengthDesired > _totalArrayLength) {
            _lengthDesired = _totalArrayLength - _cursorStart;
        }
        /// @dev Prevent to reach an index that doesn't exist in the array
        address[] memory array = new address[](_lengthDesired);
        for (uint256 i = _cursorStart; i < _cursorStart + _lengthDesired; ) {
            array[i - _cursorStart] = _fullArray[i];
            unchecked {
                ++i;
            }
        }
        return array;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        AGGREGATORS GETTERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    function getAllBaseAggregators() public view returns (address[] memory) {
        return allBaseAggregators;
    }

    function getAggregatorCloneLength(address baseAggregator) public view returns (uint256) {
        return aggregatorClones[baseAggregator].length;
    }

    function getAggregatorContracts(
        address baseAggregator,
        uint256 cursor,
        uint256 lengthDesired
    ) external view returns (address[] memory) {
        return _paginate(aggregatorClones[baseAggregator], cursor, lengthDesired);
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            SETTERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    function setOracle(ICvgOracle newCvgOracle) external onlyOwner {
        cvgOracle = newCvgOracle;
    }

    function setTreasuryStaking(address newTreasuryStakingMultisig) external onlyOwner {
        treasuryStaking = newTreasuryStakingMultisig;
    }

    function setTreasuryBonds(address newTreasuryBondsMultisig) external onlyOwner {
        treasuryBonds = newTreasuryBondsMultisig;
    }

    function setBondCalculator(IBondCalculator newBondCalculator) external onlyOwner {
        bondCalculator = newBondCalculator;
    }

    function setTreasuryDao(address newTreasuryDao) external onlyOwner {
        treasuryDao = newTreasuryDao;
    }

    function setCloneFactory(address newCloneFactory) external onlyOwner {
        cloneFactory = newCloneFactory;
    }

    function setNewVersionBaseAggregator(address _newBaseAggregator) external onlyOwner {
        allBaseAggregators.push(_newBaseAggregator);
    }

    function setCvg(ICvg _cvgToken) external onlyOwner {
        cvgToken = _cvgToken;
    }

    function setVestingCvg(address _vestingCvg) external onlyOwner {
        vestingCvg = _vestingCvg;
    }
}
