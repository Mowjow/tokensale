pragma solidity ^0.4.11;

import "./Finalizable.sol";

/**
 * @title FinalizableMowjow
 * @dev Extension of Crowdsale where an owner can do extra work after crowdsale is finished.
 *
*/
contract FinalizableMowjow is Finalizable {

    bool public isFinishedCrowdsale;
    address public multisigWallet;

    event MultisigFull(address _multisigWallet, uint256 _totalDistribution);
    
    function FinalizableMowjow(address _multisigWallet) public {
        multisigWallet = _multisigWallet;
        isFinishedCrowdsale = false;
    }

    function doFinalization(uint256 tokensForDistribution, MowjowToken token) public returns(bool) { 
        require(!isFinishedCrowdsale);
        token.mint(multisigWallet, tokensForDistribution);
        MultisigFull(multisigWallet, tokensForDistribution);
        isFinishedCrowdsale = true;
        return isFinishedCrowdsale;
    }

    function sendTokensToGroup(uint256 tokensForGroup,
        address walletOfGroup, MowjowToken token) internal returns(bool) {
    }

    function calculateTokensGroup(uint256 remainingTokens,
        uint256 rateForGroup) public returns(uint256 tokensGroup) {
    }
}
