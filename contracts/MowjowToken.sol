pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/MintableToken.sol";

contract MowjowToken is MintableToken {

    string public name;
    string public symbol;
    uint public decimals;
    bool hasFinalized;

    modifier onlyFinalized() {
        require(hasFinalized);
        _;
    }

    function MowjowToken(string _name, string _symbol, uint _decimals, uint _initialSupply) public { // initial supply from params
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply;
        hasFinalized = false;
    }

    function transfer(address _to, uint256 _value) public onlyFinalized returns (bool) {       
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public onlyFinalized returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    function changeStatusFinalized() public onlyOwner {
        hasFinalized = true;
    }

}
