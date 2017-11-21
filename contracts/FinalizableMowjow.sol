pragma solidity ^0.4.11;
 

import "./Finalizable.sol";
import "./MowjowToken.sol";

/**
 * @title FinalizableMowjow
 * @dev Extension of Crowdsale where an owner can do extra work
 * after finishing.
*/
contract FinalizableMowjow is MowjowToken { 

    bool public isFinishedCrowdsale = false;
    address public walletReserveFund;
    address public walletIssuer;
    address public walletGrowsReserve;
    address public walletGrowsFund;
    
    function doFinalization(uint256 totalTranchesSaleTokens, uint256 remainingTokensAfterTranches, uint256 weiRaised, MowjowToken token) public returns(bool) {
        require(remainingTokensAfterTranches > 0);
        require(weiRaised > 0);
        isFinishedCrowdsale = true; 
        return isFinishedCrowdsale;
    }

    function sendTokensToGroup(uint256 tokensForGroup, address walletOfGroup, MowjowToken token) internal returns(bool) {
        require(isFinishedCrowdsale);
        require(tokensForGroup > 0); 
        //require(token.totalSupply() - tokensForGroup);  
        token.mint(walletOfGroup, tokensForGroup); 
        return true;
    } 

    function calculateTokensGroup(uint256 remainingTokens, uint256 rateForGroup) public returns(uint256 tokensGroup) {
        require(isFinishedCrowdsale); 
        require(rateForGroup > 0); 
        return tokensGroup;
    } 
}
