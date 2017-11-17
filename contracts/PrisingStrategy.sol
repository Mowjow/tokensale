pragma solidity ^0.4.11; 


contract PrisingStrategy {
    function setTranche(uint256[] _bonuses, uint[] _valueForTranches) public returns(bool);
    function countTokens(uint256 _value) public returns (uint256 tokensAndBonus);
    function isTrancheSet() internal constant returns (bool);
   
}
