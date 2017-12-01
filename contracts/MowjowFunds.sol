pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/ownership/Ownable.sol"; 
import "./MowjowToken.sol";


contract  MowjowFunds is Ownable {

    /** How much we have allocated to the funds*/
    mapping(uint => uint256) public balancesOfFunds;
    address[] actionOwners;

    event AddedBalanceToFund(uint numberFund, uint256 addedTokens, uint256 sumTokensFund);
    event SentFromFund(uint numberFund, address destination, uint256  sentTokens, uint256 sumTokensFund);

    /*
    *  @dev Check amount in the fund
    */
    modifier fundHasAmount(uint numberOfFund, uint256 amount) {
        bool has = balancesOfFunds[numberOfFund] >= amount;
        require(has);
        _;
    }

    /*
    *  @dev Check address of the sender with addresses of owners
    */
    modifier canExecute(address contestant) {
        bool canExec = false;
        for(uint i=0;i<actionOwners.length;i++) {
            if(actionOwners[i] == contestant) {
                canExec = true;
            }
        }
        require(canExec);
        _;
    }

    function MowjowFunds() {
        
    }

    /*
    * @dev Finance tokens to one of funds
    */
    function fund(uint numberOfFund, uint256 amount) public canExecute(msg.sender) {
        balancesOfFunds[numberOfFund] += amount;
        AddedBalanceToFund(numberOfFund, amount, balancesOfFunds[numberOfFund]);
    }

    /*
    *  @dev Send tokens from one of funds to a reciver
    */
    function transferToFund(address destinationAddress, uint numberOfFund,
        uint256 amount, MowjowToken token) public canExecute(msg.sender) fundHasAmount(numberOfFund, amount) {
        token.transfer(destinationAddress, amount);
        balancesOfFunds[numberOfFund] -= amount;
        SentFromFund(numberOfFund, destinationAddress, amount, balancesOfFunds[numberOfFund]);
    }

    /*
    * @dev Setting owners of the contract
    */
    function setActionOwners(address[] _actionOwners) onlyOwner {
        require(actionOwners.length == 0);
        actionOwners = _actionOwners;
    }
}
