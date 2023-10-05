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

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../interfaces/ICvgControlTower.sol";

contract Cvg is ERC20 {
    uint256 public constant MAX_AIRDROP = 1_500_000 * 10 ** 18;
    uint256 public constant MAX_VESTING = 40_500_000 * 10 ** 18;

    ICvgControlTower public immutable cvgControlTower;
    address public immutable airdrop;

    uint256 public mintedAirdrop;

    constructor(ICvgControlTower _cvgControlTower, address _vestingCvg, address _airdrop) ERC20("Convergence", "CVG") {
        _mint(_vestingCvg, MAX_VESTING);
        cvgControlTower = _cvgControlTower;
        airdrop = _airdrop;
    }

    function mintAirdrop(address account, uint256 amount) external {
        require(msg.sender == airdrop, "NOT_AIRDROP");
        require(mintedAirdrop + amount <= MAX_AIRDROP, "MAX_SUPPLY_AIRDROP");

        mintedAirdrop += amount;
        _mint(account, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
