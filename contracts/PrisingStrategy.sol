pragma solidity ^0.4.11;
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract PrisingStrategy is Ownable {
    uint256 bonusRate;
    uint256 tokensForSale;
    uint daysOfTranches;

    function setTranche(uint daysOfTranche, uint256 tokenForTranchePeriod, uint256 bonusForTranchePeriod);
    function isTrancheSet() returns (bool);
}
