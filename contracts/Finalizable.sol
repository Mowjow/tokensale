pragma solidity ^0.4.11;

/**
* @title Finalizable
* @dev Contract with abstract methods for finalizing Crowdsale
*/
contract Finalizable {
     function doFinalization(uint256 longTermReserve, uint256 rewardsEngine, uint256 team) public returns(bool);
     function sendTokensToGroup(uint256 tokensForGroup, address walletOfGroup) internal returns(bool);
}