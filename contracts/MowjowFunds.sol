pragma solidity ^0.4.11; 


import "zeppelin-solidity/contracts/ownership/Ownable.sol"; 
import "./MowjowToken.sol";

contract  MowjowFunds is Ownable {  
     
    /** How much we have allocated to the funds*/
    mapping(uint => uint256) public balancesOfFunds; 
    event AddedBalanceToFund(uint numberFund, uint256 addedTokens, uint256 sumTokensFund);
    event SentFromFund(uint numberFund, address destination, uint256  sentTokens, uint256 sumTokensFund);
    event fail(string fail);
    function MowjowFunds() {
        
    }

    function fund(uint numberOfFund, uint256 amount) public onlyOwner {
        balancesOfFunds[numberOfFund] += amount;
        AddedBalanceToFund(numberOfFund, amount, balancesOfFunds[numberOfFund]);
    }

    function transferToFund(address destinationAddress, uint numberFund, uint256 amount, MowjowToken token) public onlyOwner {
        require(balancesOfFunds[numberFund] >= amount); 
        SentFromFund(numberFund, destinationAddress, amount, balancesOfFunds[numberFund]);
        token.transfer(destinationAddress, amount);       
        balancesOfFunds[numberFund] -= amount;
        SentFromFund(numberFund, destinationAddress, amount, balancesOfFunds[numberFund]);
    }    
}
