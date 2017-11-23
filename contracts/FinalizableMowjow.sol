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
    address public multisigWallet;
    //address public walletReserveFund; 
    //address public walletGrowsReserve;
    //address public walletGrowsFund;
    event MultisigFull(address _multisigWallet, uint256 _totalDistribution);
    
    function FinalizableMowjow(address _multisigWallet) {
        multisigWallet = _multisigWallet;
    }

    function doFinalization(uint256 tokensForDistribution, MowjowToken token) public returns(bool) { 
        require(!isFinishedCrowdsale);
        token.mint(multisigWallet, tokensForDistribution); 
        MultisigFull(multisigWallet, tokensForDistribution);
        isFinishedCrowdsale = true; 
        return isFinishedCrowdsale;
    }

    function sendTokensToGroup(uint256 tokensForGroup, address walletOfGroup, MowjowToken token) internal returns(bool) {

    }

    function calculateTokensGroup(uint256 remainingTokens, uint256 rateForGroup) public returns(uint256 tokensGroup) {
        
    }
}
