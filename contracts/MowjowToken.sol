pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol"; 
import "zeppelin-solidity/contracts/math/Math.sol";
import "./Vesting.sol";   

contract MowjowToken is MintableToken, Vesting {

    string public name = "MowjowToken";
    string public symbol = "MJT";
    uint public decimals = 18;
    uint256 public INITIAL_SUPPLY = 75 * 1e8;  

    function MowjowToken() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }   
}
