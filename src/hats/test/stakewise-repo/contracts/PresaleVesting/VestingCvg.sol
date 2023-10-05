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

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

import "../interfaces/IPresaleCvgWl.sol";
import "../interfaces/IPresaleCvgSeed.sol";
import "../interfaces/ICvgControlTower.sol";
import "../interfaces/IboInterface.sol";

contract VestingCvg is Ownable2Step {
    using SafeERC20 for IERC20;

    /// @dev Struct Info about VestingSchedules
    struct VestingSchedule {
        bool revoked;
        uint184 startTimestamp;
        uint16 daysBeforeCliff;
        uint16 daysAfterCliff;
        uint8 vestingType;
        uint24 dropCliff;
        uint256 totalAmount;
        uint256 totalReleased;
    }
    IPresaleCvgWl public presaleWl;
    IPresaleCvgSeed public presaleSeed;
    IboInterface public ibo;
    IERC20 public cvg;

    address public whitelistedTeam;
    address public whitelistedDao;

    /// @dev Total Current Amount CVG for all vestingSchedules
    uint256 public vestingSchedulesTotalAmount;

    /// @dev Init first VestingScheduleId
    uint256 public nextVestingScheduleId = 1;

    /// @dev Amount released Team & DAO
    uint256 public amountReleasedTeam;
    uint256 public amountReleasedDao;

    /// @dev Types of TEAM & DAO
    uint256 private constant TYPE_SEED = 1;
    uint256 private constant TYPE_WL = 2;
    uint256 private constant TYPE_IBO = 3;
    uint256 private constant TYPE_TEAM = 4;
    uint256 private constant TYPE_DAO = 5;

    /// @dev Max supply TEAM & DAO
    uint256 public constant MAX_SUPPLY_TEAM = 12_750_000 * 10 ** 18;
    uint256 public constant MAX_SUPPLY_DAO = 15_000_000 * 10 ** 18;

    uint256 public constant ONE_DAY = 1 days;

    uint256 public constant ONE_GWEI = 10 ** 9;

    /// @dev Stock VestingScheduleIds
    uint256[] public vestingSchedulesIds;

    /// @dev VestingScheduleId associated to the vesting schedule info
    mapping(uint256 => VestingSchedule) public vestingSchedules; // vestingScheduleId =>  VestingSchedule

    mapping(uint256 => uint256) public amountReleasedIdSeed; // tokenId => amountReleased
    mapping(uint256 => uint256) public amountReleasedIdWl; // tokenId => amountReleased
    mapping(uint256 => uint256) public amountReleasedIdIbo; // tokenId => amountReleased

    mapping(uint256 => uint256) public vestingIdForType; //type vesting => vestingScheduleId

    constructor(
        ICvgControlTower _cvgControlTower,
        IPresaleCvgWl _presaleWl,
        IPresaleCvgSeed _presaleSeed,
        IboInterface _ibo
    ) {
        presaleWl = _presaleWl;
        presaleSeed = _presaleSeed;
        ibo = _ibo;
        _transferOwnership(_cvgControlTower.treasuryDao());
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            MODIFIERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */

    modifier onlyOwnerOfSeed(uint256 _tokenId) {
        require(presaleSeed.ownerOf(_tokenId) == msg.sender, "NOT_OWNED");
        _;
    }

    modifier onlyOwnerOfWl(uint256 _tokenId) {
        require(presaleWl.ownerOf(_tokenId) == msg.sender, "NOT_OWNED");
        _;
    }

    modifier onlyOwnerOfIbo(uint256 _tokenId) {
        require(ibo.ownerOf(_tokenId) == msg.sender, "NOT_OWNED");
        _;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            SETTERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    function setCvg(IERC20 _cvg) external onlyOwner {
        cvg = _cvg;
    }

    function setPresale(IPresaleCvgWl _newPresaleWl) external onlyOwner {
        presaleWl = _newPresaleWl;
    }

    function setPresaleSeed(IPresaleCvgSeed _newPresaleSeed) external onlyOwner {
        presaleSeed = _newPresaleSeed;
    }

    function setWhitelistTeam(address newWhitelistedTeam) external onlyOwner {
        whitelistedTeam = newWhitelistedTeam;
    }

    function setWhitelistDao(address newWhitelistedDao) external onlyOwner {
        whitelistedDao = newWhitelistedDao;
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            GETTERS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    function getWithdrawableAmount() public view returns (uint256) {
        return (cvg.balanceOf(address(this)) - vestingSchedulesTotalAmount);
    }

    function getTotalReleasedScheduleId(uint256 _vestingScheduleId) external view returns (uint256) {
        return (vestingSchedules[_vestingScheduleId].totalReleased);
    }

    function getInfoVestingTokenId(
        uint256 _tokenId,
        uint256 _tokenType
    )
        public
        view
        returns (uint256 amountReleasable, uint256 totalCvg, uint256 amountRedeemed, uint256 vestingScheduleId)
    {
        (amountReleasable, totalCvg, amountRedeemed, vestingScheduleId) = _computeReleaseAmount(_tokenId, _tokenType);
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            EXTERNALS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    /**
     * @notice Create vestingScheduleId for a specific type of presalers
                    - function only usable by owner
                    - update the total CVG amount available on this contract
     * @param _totalAmount total CVG amount allocated for the presaler type
     * @param _startTimestamp start timestamp of the vesting, every vesting should have the same start
     * @param _daysBeforeCliff daysBeforeCliff - period in days between start of the schedule and the cliff
     * @param _daysAfterCliff daysAfterCliff - period in days between the cliff and the end of the vesting
     * @param _vestingType type presaler vesting (ex : 1=SEED/PRESEED, 2=WL_S, 3=WL_M, 4=WL_L, 5=TEAM, 6=DAO)
     * @param _dropCliff Percent drop at the daysBeforeCliff release (per 1000) => 50% = 500 / 5% = 50
     */
    function createVestingSchedule(
        uint256 _totalAmount,
        uint184 _startTimestamp,
        uint16 _daysBeforeCliff,
        uint16 _daysAfterCliff,
        uint8 _vestingType,
        uint24 _dropCliff
    ) external onlyOwner {
        require(
            presaleSeed.saleState() == IPresaleCvgSeed.SaleState.OVER &&
                presaleWl.saleState() == IPresaleCvgWl.SaleState.OVER,
            "PRESALE_ROUND_NOT_FINISHED"
        );
        require(getWithdrawableAmount() >= _totalAmount, "AMOUNT");
        require(_totalAmount > 0, "LTE_AMOUNT");

        if (_vestingType == TYPE_TEAM) {
            require(_totalAmount == MAX_SUPPLY_TEAM, "WRONG_AMOUNT_TEAM");
        }

        if (_vestingType == TYPE_DAO) {
            require(_totalAmount == MAX_SUPPLY_DAO, "WRONG_AMOUNT_DAO");
        }

        uint256 vestingScheduleId = nextVestingScheduleId;
        vestingSchedulesIds.push(vestingScheduleId);

        vestingSchedulesTotalAmount += _totalAmount;

        //set struct vesting
        vestingSchedules[nextVestingScheduleId] = VestingSchedule({
            revoked: false,
            totalAmount: _totalAmount,
            totalReleased: 0,
            startTimestamp: _startTimestamp,
            daysBeforeCliff: _daysBeforeCliff,
            daysAfterCliff: _daysAfterCliff,
            vestingType: _vestingType,
            dropCliff: _dropCliff
        });

        vestingIdForType[_vestingType] = nextVestingScheduleId;
        nextVestingScheduleId++;
    }

    /**
     * @notice Revokes vesting schedule for a specific ID
     * @param _vestingScheduleId ID of the vesting schedule to be revoked
     */
    function revokeVestingSchedule(uint256 _vestingScheduleId) external onlyOwner {
        require(!vestingSchedules[_vestingScheduleId].revoked, "IRREVOCABLE");
        uint256 totalAmountScheduleId = vestingSchedules[_vestingScheduleId].totalAmount;
        uint256 releasedAmountScheduleId = vestingSchedules[_vestingScheduleId].totalReleased;
        uint256 unreleasedAmountScheduleId = totalAmountScheduleId - releasedAmountScheduleId;
        vestingSchedulesTotalAmount -= unreleasedAmountScheduleId;
        vestingSchedules[_vestingScheduleId].revoked = true;
    }

    /**
     * @notice Release CVG token available for the releaseTime
     * @param _tokenId token Id Seed
     */
    function releaseSeed(uint256 _tokenId) external onlyOwnerOfSeed(_tokenId) {
        (uint256 amountToRelease, , , uint256 vestingScheduleId) = _computeReleaseAmount(_tokenId, TYPE_SEED);
        require(amountToRelease > 0, "NOT_RELEASABLE");
        require(!vestingSchedules[vestingScheduleId].revoked, "VESTING_REVOKED");

        //update totalReleased & amountReleasedId & vestingSchedulesTotalAmount
        vestingSchedules[vestingScheduleId].totalReleased += amountToRelease;

        amountReleasedIdSeed[_tokenId] += amountToRelease;

        vestingSchedulesTotalAmount -= amountToRelease;

        //transfer Cvg amount to release
        cvg.transfer(msg.sender, amountToRelease);
    }

    /**
     * @notice Release CVG token available for the releaseTime
     * @param _tokenId token Id Wl
     */
    function releaseWl(uint256 _tokenId) external onlyOwnerOfWl(_tokenId) {
        (uint256 amountToRelease, , , uint256 vestingScheduleId) = _computeReleaseAmount(_tokenId, TYPE_WL);

        require(amountToRelease > 0, "NOT_RELEASABLE");
        require(!vestingSchedules[vestingScheduleId].revoked, "VESTING_REVOKED");

        //update totalReleased & amountReleasedIdSeed & vestingSchedulesTotalAmount
        vestingSchedules[vestingScheduleId].totalReleased += amountToRelease;

        amountReleasedIdWl[_tokenId] += amountToRelease;

        vestingSchedulesTotalAmount -= amountToRelease;

        //transfer Cvg amount to release
        cvg.transfer(msg.sender, amountToRelease);
    }

    /**
     * @notice Release CVG token available for the releaseTime
     * @param _tokenId token Id IBO
     */
    function releaseIbo(uint256 _tokenId) external onlyOwnerOfIbo(_tokenId) {
        (uint256 amountToRelease, , , uint256 vestingScheduleId) = _computeReleaseAmount(_tokenId, TYPE_IBO);

        require(amountToRelease > 0, "NOT_RELEASABLE");
        require(!vestingSchedules[vestingScheduleId].revoked, "VESTING_REVOKED");

        //update totalReleased & amountReleasedIdSeed & vestingSchedulesTotalAmount
        vestingSchedules[vestingScheduleId].totalReleased += amountToRelease;

        amountReleasedIdIbo[_tokenId] += amountToRelease;

        vestingSchedulesTotalAmount -= amountToRelease;

        //transfer Cvg amount to release
        cvg.transfer(msg.sender, amountToRelease);
    }

    function releaseTeamOrDao(bool _isTeam) external {
        (uint256 amountToRelease, uint256 vestingScheduleId) = _computeReleaseAmountTeamDao(_isTeam);

        require(amountToRelease > 0, "NOT_RELEASABLE");
        require(!vestingSchedules[vestingScheduleId].revoked, "VESTING_REVOKED");

        if (_isTeam) {
            require(msg.sender == whitelistedTeam, "NOT_TEAM");
            amountReleasedTeam += amountToRelease;
        } else {
            require(msg.sender == whitelistedDao, "NOT_DAO");
            amountReleasedDao += amountToRelease;
        }

        /// @dev update totalReleased & amountReleasedIdSeed & vestingSchedulesTotalAmount
        vestingSchedules[vestingScheduleId].totalReleased += amountToRelease;

        vestingSchedulesTotalAmount -= amountToRelease;

        /// @dev transfer Cvg amount to release
        cvg.transfer(msg.sender, amountToRelease);
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                            INTERNALS
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    function _computeReleaseAmountTeamDao(
        bool _isTeam
    ) internal view returns (uint256 amountToRelease, uint256 _vestingScheduleId) {
        uint256 vestingType;
        uint256 totalAmount;
        uint256 totalAmountReleased;

        if (_isTeam) {
            totalAmountReleased = amountReleasedTeam;
            vestingType = TYPE_TEAM;
            totalAmount = MAX_SUPPLY_TEAM;
        } else {
            totalAmountReleased = amountReleasedDao;
            vestingType = TYPE_DAO;
            totalAmount = MAX_SUPPLY_DAO;
        }

        _vestingScheduleId = vestingIdForType[vestingType];
        require(_vestingScheduleId != 0, "SCHEDULE_NOT_INIT");
        amountToRelease = calculateRelease(_vestingScheduleId, totalAmount, totalAmountReleased);
    }

    function _computeReleaseAmount(
        uint256 _tokenId,
        uint256 tokenType
    )
        internal
        view
        returns (uint256 amountToRelease, uint256 totalAmount, uint256 totalAmountReleased, uint256 _vestingScheduleId)
    {
        uint256 vestingType;

        if (tokenType == TYPE_SEED) {
            totalAmountReleased = amountReleasedIdSeed[_tokenId];
            IPresaleCvgSeed.PresaleInfo memory seedInfo = presaleSeed.presaleInfoTokenId(_tokenId);
            vestingType = TYPE_SEED;
            totalAmount = seedInfo.cvgAmount;
        } else if (tokenType == TYPE_WL) {
            totalAmountReleased = amountReleasedIdWl[_tokenId];
            IPresaleCvgWl.PresaleInfo memory wlInfo = presaleWl.presaleInfos(_tokenId);
            vestingType = TYPE_WL;
            totalAmount = wlInfo.cvgAmount;
        } else {
            totalAmountReleased = amountReleasedIdIbo[_tokenId];
            vestingType = TYPE_IBO;
            totalAmount = ibo.totalCvgPerToken(_tokenId);
        }
        _vestingScheduleId = vestingIdForType[vestingType];
        require(_vestingScheduleId != 0, "SCHEDULE_NOT_INIT");
        amountToRelease = calculateRelease(_vestingScheduleId, totalAmount, totalAmountReleased);
    }

    function calculateRelease(
        uint256 vestingSchedulesId,
        uint256 totalAmount,
        uint256 totalAmountReleased
    ) private view returns (uint256 amountToRelease) {
        uint256 cliffTimestamp = vestingSchedules[vestingSchedulesId].startTimestamp +
            vestingSchedules[vestingSchedulesId].daysBeforeCliff *
            ONE_DAY;

        uint256 endVestingTimestamp = cliffTimestamp + vestingSchedules[vestingSchedulesId].daysAfterCliff * ONE_DAY;

        if (block.timestamp > cliffTimestamp) {
            if (block.timestamp > endVestingTimestamp) {
                amountToRelease = totalAmount - totalAmountReleased;
            } else {
                uint256 ratio = ((endVestingTimestamp - block.timestamp) * ONE_GWEI) /
                    (endVestingTimestamp - cliffTimestamp);

                uint256 amountDroppedAtCliff = (totalAmount * vestingSchedules[vestingSchedulesId].dropCliff) / 1000;

                uint256 totalAmountAfterCliff = totalAmount - amountDroppedAtCliff;

                amountToRelease =
                    amountDroppedAtCliff +
                    (((ONE_GWEI - ratio) * totalAmountAfterCliff) / ONE_GWEI) -
                    totalAmountReleased;
            }
        }
    }

    /* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=
                        WITHDRAW OWNER
    =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-= */
    function withdrawOnlyExcess(uint256 _amount) external onlyOwner {
        require(_amount > 0, "LTE");
        require(_amount <= getWithdrawableAmount(), "EXCEEDS_WITHDRAWABLE_AMOUNT");
        cvg.transfer(msg.sender, _amount);
    }
}
