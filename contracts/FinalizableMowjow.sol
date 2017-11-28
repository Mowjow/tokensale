pragma solidity ^0.4.11;

import "./Finalizable.sol";
//import "./MowjowFunds.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
/**
 * @title FinalizableMowjow
 * @dev Extension of Crowdsale where an owner can do extra work after crowdsale is finished.
 *
*/
contract FinalizableMowjow is Finalizable {
    using SafeMath for uint256;

    bool public isFinishedCrowdsale;
//    MowjowFunds public tokenWallet;

    event MultisigFull(address _multisigWallet, uint256 _totalDistribution);
//address _tokenWallet
    function FinalizableMowjow() public {
//        tokenWallet = MowjowFunds(_tokenWallet);
        isFinishedCrowdsale = false;
    }

    function doFinalization(uint256 longTermReserve, uint256 rewardsEngine, uint256 team, MowjowToken token) public returns(bool) {
//        require(!isFinishedCrowdsale);
//
//        uint256 totalBonuses = longTermReserve.add(rewardsEngine).add(team);
//        address tokenWalletOwner = tokenWallet.owner();
//        token.mint(tokenWalletOwner, totalBonuses);
//        MultisigFull(tokenWalletOwner, totalBonuses);
//
//        // 0 - longTermReserve
//        // 1 - rewards
//        // 2 - team
//        tokenWallet.fund(0, longTermReserve);
//        tokenWallet.fund(1, rewardsEngine);
//        tokenWallet.fund(1, team);
//
//        isFinishedCrowdsale = true;
        return isFinishedCrowdsale;
    }

    function sendTokensToGroup(uint256 tokensForGroup,
        address walletOfGroup, MowjowToken token) internal returns(bool) {
    }
}
