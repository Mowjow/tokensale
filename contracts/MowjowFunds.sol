pragma solidity ^0.4.11; 


import "zeppelin-solidity/contracts/ownership/Ownable.sol"; 
import "./MowjowToken.sol";

contract  MowjowFunds is Ownable {

    /** How much we have allocated to the funds*/
    mapping(uint => uint256) public balancesOfFunds; 
    event AddedBalanceToFund(uint numberFund, uint256 addedTokens, uint256 sumTokensFund);
    event SentFromFund(uint numberFund, address destination, uint256  sentTokens, uint256 sumTokensFund);

    modifier fundHasAmount(uint numberOfFund, uint256 amount) {
        bool has = balancesOfFunds[numberOfFund] >= amount;
        require(has);
        _;
    }

    function MowjowFunds() {
        
    }

    function fund(uint numberOfFund, uint256 amount) public onlyOwner {
        balancesOfFunds[numberOfFund] += amount;
        AddedBalanceToFund(numberOfFund, amount, balancesOfFunds[numberOfFund]);
    }
    event sndr(address sender);
    function transferToFund(address destinationAddress, uint numberOfFund,
        uint256 amount, MowjowToken token) public onlyOwner fundHasAmount(numberOfFund, amount) {
        token.transfer(destinationAddress, amount);
        balancesOfFunds[numberOfFund] -= amount;
        SentFromFund(numberOfFund, destinationAddress, amount, balancesOfFunds[numberOfFund]);
    }
}
