pragma solidity ^0.4.11; 

contract PrisingStrategy {
    function setTranche(uint daysOfTranche, uint256 tokenForTranchePeriod, uint256 bonusForTranchePeriod) returns (bool);
    function isTrancheSet() internal constant returns (bool);
    function countBonus() public returns (uint256 bonus);
}
