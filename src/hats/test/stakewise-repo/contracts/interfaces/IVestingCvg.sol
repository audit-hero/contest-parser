// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./IPresaleCvgSeed.sol";

interface IVestingCvg {
    /// @dev Struct Info about VestingSchedules
    struct VestingSchedule {
        bool revoked;
        uint256 startTimestamp;
        uint256 daysBeforeCliff;
        uint256 daysAfterCliff;
        uint256 vestingType;
        uint256 dropCliff;
        uint256 totalAmount;
        uint256 totalReleased;
    }

    function vestingSchedules(uint256 vestingScheduleId) external view returns (VestingSchedule memory);

    function vestingIdForType(uint256 vestingType) external view returns (uint256);

    function getInfoVestingTokenId(
        uint256 _tokenId,
        uint256 _tokenType
    ) external view returns (uint256, uint256, uint256, uint256);

    function whitelistedTeam() external view returns (address);

    function vestingSchedulesTotalAmount() external view returns (uint256);

    function presaleSeed() external view returns (IPresaleCvgSeed);

    function MAX_SUPPLY_TEAM() external view returns (uint256);
}
