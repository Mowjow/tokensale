pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol"; 
import "./MowjowToken.sol";
import "./TrancheStrategy.sol";

contract MowjowCrowdsale is CappedCrowdsale, TrancheStrategy { 

    // The token being sold
    MowjowToken public token;    

    /**
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event MowjowTokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    /*
    * @dev The constructor function to initialize the token related properties
    * @param _startTime uint256     Specifies the start date of the presale
    * @param _endTime   uint256     Specifies the end date of the ICO
    * @param _rate      uint256     Specifies how many token units a buyer gets per wei
    * @param _wallet    address     Specifies address where funds are collected
    * @param _cap       uint256     Specifies total count of tokens
    */
    function MowjowCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap )
    CappedCrowdsale(_cap) Crowdsale(_startTime, _endTime, _rate, _wallet) {
        setTranshesData();
    }

    /*
    * @dev This method have  overrided  from  crowdsale
    */ 
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != 0x0);
        require(validPurchase()); 
        uint256 bonusRate = countBonus(startTime);  
        uint256 weiAmount = msg.value; 

        // calculate token amount without bonus
        uint256 tokens = weiAmount.mul(rate);

        // calculate bonus 
        uint256 bonus = tokens.mul(bonusRate).div(100);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        
        // total tokens amount to be created
        uint256 tokensAndBonus = tokens + bonus;

        token.mint(beneficiary, tokensAndBonus);
        uint currentPeriod = defineTranchePeriod(startTime);
        
        MowjowTokenPurchase(msg.sender, beneficiary, weiAmount, tokensAndBonus);
        tokensForSale -= tokens;
        forwardFunds();
    }

    // overriding Crowdsale#hasEnded to add cap logic
    // @return true if crowdsale event has ended
    function hasEnded() public constant returns (bool) {
        bool noOverCap = msg.value > cap;
        bool capReached = weiRaised >= cap;
        return super.hasEnded() || capReached || noOverCap;
    }
    
    /**
    * @dev Check the sale period is still and investor's amount no zero
    * @return true if the transaction can buy tokens
    */ 
    function validPurchase() internal constant returns (bool) { 
        bool nonZeroPurchase = msg.value != 0;
        uint currentPeriod = defineTranchePeriod(startTime);
        uint tokenSold = getTokensSoldInTranche(startTime);
        bool noOverSold = isNoOverSoldInCurrentTranche(msg.value, tokenSold); 
        bool noEnded = hasEnded(); 
        return nonZeroPurchase && !noEnded && noOverSold;
    }   

    /*
    * @dev Creates the token to be sold.
    * override this method to have crowdsale of a specific MowjowToken token.
    * @return MintableToken 
    */
    function createTokenContract() internal returns (MintableToken) {
        token = new MowjowToken();
        return token;
    }

    // send ether to the fund collection wallet
    // override to create custom fund forwarding mechanisms
    function forwardFunds() internal {
        wallet.transfer(msg.value);
    } 
}
