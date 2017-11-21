pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol"; 
import "zeppelin-solidity/contracts/math/Math.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Vesting.sol";   

contract MowjowToken is MintableToken, Vesting{

    string public name = "MowjowToken";
    string public symbol = "MJT";
    uint public decimals = 18;
    uint256 public INITIAL_SUPPLY = 75 * 1e8;
    bool hasFinalized = false;  

    modifier onlyFinalized() {
        require(hasFinalized);
        _;
    }

    function MowjowToken() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }  

    function transfer(address _to, uint256 _value) public onlyFinalized returns (bool) {
        balances[_to] = balances[_to].add(_value);
        balances[msg.sender].sub(_value);
       // require(!frozen || msg.sender == owner || msg.sender == bankexTokenWallet);
        //return super.transfer(_to, _value);
    } 

    function changeStatusFinalized() public onlyOwner {
        hasFinalized = true;
    }

}
