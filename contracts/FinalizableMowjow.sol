pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Finalizable.sol";
import "./MowjowFunds.sol";
import "./MowjowToken.sol";



/**
 * @title FinalizableMowjow
 * @dev Extension of Crowdsale where an owner can do extra work after crowdsale is finished.
 *
*/
contract FinalizableMowjow is Finalizable {
    using SafeMath for uint256;

    bool public isFinishedCrowdsale;
    MowjowFunds public tokenWallet;


    function FinalizableMowjow(address _tokenWallet) public {
        tokenWallet = MowjowFunds(_tokenWallet);
        isFinishedCrowdsale = false;
    }


    function doFinalization(uint256 _longTermReserve, uint256 _rewardsEngine, uint256 _team) public onlyOwner returns(bool) {
        require(!isFinishedCrowdsale);

        // 0 - longTermReserve
        // 1 - rewards
        // 2 - team
        tokenWallet.fund(0, _longTermReserve);
        tokenWallet.fund(1, _rewardsEngine);
        tokenWallet.fund(1, _team);

        isFinishedCrowdsale = true;
        return isFinishedCrowdsale;
    }

}
