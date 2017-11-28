pragma solidity ^0.4.11; 


import "zeppelin-solidity/contracts/ownership/Ownable.sol"; 
import "./MowjowToken.sol";

contract  MowjowFunds is Ownable {

    /** How much we have allocated to the funds*/
    mapping(uint => uint256) public balancesOfFunds;
    address[] actionOwners;

    event AddedBalanceToFund(uint numberFund, uint256 addedTokens, uint256 sumTokensFund);
    event SentFromFund(uint numberFund, address destination, uint256  sentTokens, uint256 sumTokensFund);

    modifier fundHasAmount(uint numberOfFund, uint256 amount) {
        bool has = balancesOfFunds[numberOfFund] >= amount;
        require(has);
        _;
    }

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

    function fund(uint numberOfFund, uint256 amount) public canExecute(msg.sender) {
        balancesOfFunds[numberOfFund] += amount;
        AddedBalanceToFund(numberOfFund, amount, balancesOfFunds[numberOfFund]);
    }

    function transferToFund(address destinationAddress, uint numberOfFund,
        uint256 amount, MowjowToken token) public canExecute(msg.sender) fundHasAmount(numberOfFund, amount) {
        token.transfer(destinationAddress, amount);
        balancesOfFunds[numberOfFund] -= amount;
        SentFromFund(numberOfFund, destinationAddress, amount, balancesOfFunds[numberOfFund]);
    }

    function setActionOwners(address[] _actionOwners) onlyOwner {
        require(actionOwners.length == 0);

        actionOwners = _actionOwners;
    }
}
