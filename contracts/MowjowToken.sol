pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "./Haltable.sol";


contract MowjowToken is MintableToken, Haltable {

    string public name;
    string public symbol;
    uint public decimals;
    uint256 public initialSupply;
    bool hasFinalized;

    /*
    * @dev For unavailable transfer of tokens till owner have changed status
    */
    modifier onlyFinalized() {
        require(hasFinalized);
        _;
    }

    function MowjowToken(string _name, string _symbol, uint _decimals, uint256 _initialSupply) public { // initial supply from params
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        hasFinalized = false;
        initialSupply = _initialSupply;
    }

    /*
    * @dev Can use if owner changed status for available transfer
    */
    function transfer(address _to, uint256 _value) public onlyFinalized whenNotPaused returns (bool) {
        return super.transfer(_to, _value);
    }

    /*
    * @dev Can use if owner changed status for available transfer
    */
    function transferFrom(address _from, address _to, uint256 _value) public onlyFinalized whenNotPaused returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    /*
    * @dev Change status of tokens for available transfer
    */
    function changeStatusFinalized() public onlyOwner whenNotPaused {
        hasFinalized = true;
    }

    /*
    * @dev set administrator for manage pause statement
    */
    function setOwnerPauseStatement(address _ownerPauseStatement) public onlyOwner {
        ownerPauseStatement = _ownerPauseStatement;
    }

}
