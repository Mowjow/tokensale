pragma solidity ^0.4.11;

import "./MowjowToken.sol";

/**
* @title Finalizable
* @dev Contract with abstract methods for finalizing Crowdsale
*/
contract Finalizable {
     function doFinalization(uint256 totalTranchesSaleTokens, MowjowToken token) public returns(bool);
     function sendTokensToGroup(uint256 tokensForGroup, address walletOfGroup, MowjowToken token) internal returns(bool);
     function calculateTokensGroup(uint256 remainingTokens, uint256 rateForGroup) public returns(uint256 tokensGroup);
}