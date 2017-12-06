pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./MowjowToken.sol";


contract  MowjowFunds is Ownable {

    using SafeMath for uint256;
    /** How much we have allocated to the funds*/
    mapping(uint => uint256) public balancesOfFunds;
    address[] actionOwners;

    event AddedBalanceToFund(uint numberFund, uint256 addedTokens, uint256 sumTokensFund);
    event SentFromFund(uint numberFund, address destination, uint256  sentTokens, uint256 sumTokensFund);

    /*
    *  @dev Check amount in the fund
    */
    modifier fundHasAmount(uint _numberOfFund, uint256 _amount) {
        bool has = balancesOfFunds[_numberOfFund] >= _amount;
        require(has);
        _;
    }

    /*
    *  @dev Check address of the sender with addresses of owners
    */
    modifier canExecute(address _contestant) {
        bool canExec = false;
        for(uint i = 0; i < actionOwners.length; i++) {
            if(actionOwners[i] == _contestant) {
                canExec = true;
            }
        }
        require(canExec);
        _;
    }

    function MowjowFunds() public {
        
    }

    /*
    * @dev Finance tokens to one of funds
    */
    function fund(uint _numberOfFund, uint256 _amount) public canExecute(msg.sender) {
        balancesOfFunds[_numberOfFund] = balancesOfFunds[_numberOfFund].add(_amount);
        AddedBalanceToFund(_numberOfFund, _amount, balancesOfFunds[_numberOfFund]);
    }

    /*
    *  @dev Send tokens from one of funds
    */
    function transferToFund(address _destinationAddress, uint _numberOfFund,
        uint256 _amount, MowjowToken _token) public canExecute(msg.sender) fundHasAmount(_numberOfFund, _amount) {
        _token.transfer(_destinationAddress, _amount);
        balancesOfFunds[_numberOfFund] -= _amount;
        SentFromFund(_numberOfFund, _destinationAddress, _amount, balancesOfFunds[_numberOfFund]);
    }

    /*
    * @dev Setting owners of the contract
    */
    function setActionOwners(address[] _actionOwners) onlyOwner {
        require(actionOwners.length == 0);
        actionOwners = _actionOwners;
    }
}
