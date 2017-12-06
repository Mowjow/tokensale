pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
* @title Finalizable
* @dev Contract with abstract methods for finalizing Crowdsale
*/
contract Finalizable is Ownable {
     function doFinalization(uint256 _longTermReserve, uint256 _rewardsEngine, uint256 _team) public onlyOwner returns(bool);
}