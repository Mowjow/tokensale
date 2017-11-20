pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol"; 
import "zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol"; 
import "zeppelin-solidity/contracts/math/SafeMath.sol"; 
import "./MowjowToken.sol";
import "./TrancheStrategy.sol";
import "./FinalizableMowjow.sol";
import "./PreIcoMowjow.sol";


contract MowjowCrowdsale is CappedCrowdsale, FinalizableCrowdsale {

    using SafeMath for uint256; 

    // The token being sold
    MowjowToken mowjowToken;    
    FinalizableMowjow public finalizableMowjow;
    address public walletTeam = 0x12345;


    /** State machine    
    * - Prefunding: We have not passed start time yet
    * - Funding: Active crowdsale
    * - Finalized: The finalized has been called and succesfully executed
    */
    enum State{PreFunding, Funding, Finalized, Failure}

    /*
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event MowjowTokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    TrancheStrategy trancheStrategy;
    PreIcoMowjow public preIcoMowjow;

    modifier preIcoTime() {
        require(now < startTime);
        _;
    }

    /*
    * @dev The constructor function to initialize the token related properties
    * @param _startTime uint256     Specifies the start date of the presale
    * @param _endTime   uint256     Specifies the end date of the ICO
    * @param _rate      uint256     Specifies how many token units a buyer gets per wei
    * @param _wallet    address     Specifies address where funds are collected
    * @param _cap       uint256     Specifies total count of tokens
    */
    function MowjowCrowdsale(
        uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap, 
        TrancheStrategy _trancheStrategy, FinalizableMowjow _finalizableMowjow
    ) CappedCrowdsale(_cap) Crowdsale(_startTime, _endTime, _rate, _wallet) {
        finalizableMowjow = _finalizableMowjow;
        trancheStrategy = _trancheStrategy;
        trancheStrategy.setRate(_rate);          
    }

    /*
    * @dev This method have  overrided  from  crowdsale
    */ 
    function buyTokens(address beneficiary) public payable {
        //require(address(beneficiary) == 0x0);
        if(getState() == State.PreFunding) {
            //preIco 
            require(validPurchasePreIco(beneficiary));
             
            //require(validPurchase());  
            uint256 weiAmountPreIco = msg.value;  
            // update state
            weiRaised = weiRaised.add(weiAmountPreIco); 
            uint256 tokensAndBonusPreIco = preIcoMowjow.buyPreIcoTokens(msg.value); 
           
            mowjowToken.transfer(beneficiary, tokensAndBonusPreIco);  
            MowjowTokenPurchase(msg.sender, beneficiary, weiAmountPreIco, tokensAndBonusPreIco);
            
        } else if(getState() == State.Funding)
            require(validPurchase());  
            uint256 weiAmount = msg.value;  
            // update state
            weiRaised = weiRaised.add(weiAmount); 
            uint256 tokensAndBonus = trancheStrategy.countTokens(msg.value); 
            mowjowToken.mint(beneficiary, tokensAndBonus);  
            MowjowTokenPurchase(msg.sender, beneficiary, weiAmount, tokensAndBonus); 
        }
        
    }

    /*
    * @dev This method have  overrided  from  crowdsale
    */ 
    function startPreIco() public onlyOwner {
        preIcoMowjow = new PreIcoMowjow(startTime); 
    }

    // overriding Crowdsale#hasEnded to add cap logic
    // @return true if crowdsale event has ended
    function hasEnded() public constant returns (bool) {
        bool noOverCap = msg.value > cap; 
        bool capReached = weiRaised >= cap; 
        return super.hasEnded() || capReached || noOverCap;
    } 

    /**
    * Crowdfund state machine management.
    *
    * We make it a function and do not assign the result to a variable, so there is no chance of the variable being stale.
    */
    function getState() public constant returns (State) {
        if (isFinalized) return State.Finalized;   
        else if (block.timestamp < startTime) return State.PreFunding;
        else if (block.timestamp <= endTime && !hasEnded()) return State.Funding;  
        else return State.Failure;
    }

    /*
    * @dev Check the sale period is still and investor's amount no zero
    * @return true if the transaction can buy tokens
    */ 
    function validPurchasePreIco(address preIcoInvestor) internal constant preIcoTime returns (bool) { 
        //require(address(preIcoMowjow) == 0);  
        require(preIcoMowjow.isWhitelistInvestors(preIcoInvestor));  
        return true;    
    }
    
    /*
    * @dev Check the sale period is still and investor's amount no zero
    * @return true if the transaction can buy tokens
    */ 
    function validPurchase() internal constant returns (bool) { 
        require(msg.value != 0);
        uint256 requireTokens = msg.value.mul(rate); 
        trancheStrategy.getFreeTokensInTranche(requireTokens);
        //require(trancheStrategy.getFreeTokensInTranche(requireTokens)); 
        require(!hasEnded()); 
        return true; 
    }    

    /*
    * @dev Creates the token to be sold.
    * override this method to have crowdsale of a specific MowjowToken token.
    * @return MintableToken 
    */
    function createTokenContract() internal returns (MintableToken) {
        mowjowToken = new MowjowToken(); 
        return mowjowToken;
    }

    // send ether to the fund collection wallet
    // override to create custom fund forwarding mechanisms
    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    /*
    * @dev The overriding function from zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol 
    * should call super.finalization() to ensure the chain of finalization is executed entirely.
    * 
    */
    function finalization() internal { 
        uint256 totalTranchesSaleTokens = trancheStrategy.totalSaleTokens();
        uint256 remainingTokens = trancheStrategy.countRemainingTokens();
        finalizableMowjow.doFinalization(totalTranchesSaleTokens, remainingTokens, weiRaised, mowjowToken);
        uint256 startTimeDistribution =  now;
        uint256 cliff =  startTimeDistribution.add(60 days);
        uint256 vesting = startTimeDistribution.add(90 days);
        mowjowToken.grantVestedTokens(walletTeam, remainingTokens, startTimeDistribution, cliff, vesting, false, false);
    }
}
