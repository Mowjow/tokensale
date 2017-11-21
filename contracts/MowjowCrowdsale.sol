pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/token/MintableToken.sol"; 
import "zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol"; 
import "zeppelin-solidity/contracts/math/SafeMath.sol"; 
import "./MowjowToken.sol";
import "./TrancheStrategy.sol";
import "./FinalizableMowjow.sol"; 
import "./EarlyContribStrategy.sol";
import "./PreIcoStrategy.sol";


contract MowjowCrowdsale is FinalizableCrowdsale {

    using SafeMath for uint256; 

    // The token being sold
    MowjowToken mowjowToken;    
    FinalizableMowjow public finalizableMowjow;
    address public walletMultisig = 0x12345;
    TrancheStrategy trancheStrategy; 
    EarlyContribStrategy earlyContribStrategy; 
    PreIcoStrategy preIcoStrategy;
    address[] public earlyContributors;
    address[] public whitelistInvestors; 

    /** State machine    
    * - Prefunding: We have not passed start time yet
    * - Funding: Active crowdsale
    * - Finalized: The finalized has been called and succesfully executed
    */
    enum State{PreFunding, Funding, Finalized}

    /*
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event MowjowTokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    event PreIcoPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount); 
    event EarlyContribPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);  

    /*
    * @dev The constructor function to initialize the token related properties
    * @param _startTime uint256     Specifies the start date of the presale
    * @param _endTime   uint256     Specifies the end date of the ICO
    * @param _rate      uint256     Specifies how many token units a buyer gets per wei
    * @param _wallet    address     Specifies address where funds are collected
    * @param _cap       uint256     Specifies total count of tokens
    */
    function MowjowCrowdsale(
        uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap, EarlyContribStrategy _earlyContribStrategy,
        PreIcoStrategy _preIcoStrategy, TrancheStrategy _trancheStrategy, FinalizableMowjow _finalizableMowjow
        ) Crowdsale(_startTime, _endTime, _rate, _wallet) {
        finalizableMowjow = _finalizableMowjow;
        trancheStrategy = _trancheStrategy;
        preIcoStrategy = _preIcoStrategy;
        earlyContribStrategy = _earlyContribStrategy; 
        trancheStrategy.setRate(_rate);
        preIcoStrategy.setRate(_rate); 
        earlyContribStrategy.setRate(_rate);           
    }

    function changeTrancheStrategy(TrancheStrategy strategy) public onlyOwner {
        trancheStrategy = strategy;
    }

    function changePreIcoStrategy(PreIcoStrategy strategy) public onlyOwner {
        preIcoStrategy = strategy;
    }

    function changeEarlyContribStrategy(EarlyContribStrategy strategy) public onlyOwner {
        earlyContribStrategy = strategy;
    }

    /*
    * @dev This method have  overrided  from  crowdsale
    */ 
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != 0x0);
        uint256 weiAmount = msg.value; 
        if (getState() == State.PreFunding) {
            //preIco  
            require(isWhitelistInvestors(beneficiary));
            weiRaised = weiRaised.add(weiAmount);
            uint256 requireTokens = preIcoStrategy.countTokens(msg.value);
            require(preIcoStrategy.getFreeTokensInTranche(requireTokens)); 
            mowjowToken.mint(beneficiary, requireTokens);
            preIcoStrategy.soldInTranche(requireTokens); 
            PreIcoPurchase(msg.sender, beneficiary, msg.value, requireTokens); 
                               
        } else if (getState() == State.Funding) {
            //ico
            require(validPurchase());    
            weiRaised = weiRaised.add(weiAmount); 
            uint256 tokensAndBonus = trancheStrategy.countTokens(msg.value); 
            mowjowToken.mint(beneficiary, tokensAndBonus); 
            // icoInvestors.push(beneficiary); 
            // amountsIcoInvestors[beneficiary] = tokensAndBonus;
            MowjowTokenPurchase(msg.sender, beneficiary, weiAmount, tokensAndBonus); 
        }
        forwardFunds();        
    } 

    // overriding Crowdsale#hasEnded to add cap logic
    // @return true if crowdsale event has ended
    function hasEnded() public constant returns (bool) {
        require(!preIcoStrategy.isNoEmptyPreIcoTranche());
        // bool capReached = weiRaised >= cap; 
        return super.hasEnded();// || capReached || noOverCap;
    } 

    /**
    * Crowdfund state machine management.    
    */
    function getState() public constant returns (State) {
        if (isFinalized) return State.Finalized;   
        else if (preIcoStrategy.isNoEmptyPreIcoTranche()) return State.PreFunding;
        else if (trancheStrategy.isNoEmptyTranches()) return State.Funding;  
    }

    function addEarlyContributors(address investor, uint256 payments) public onlyOwner {
        require((getState() == State.PreFunding));
        uint256 requireTokens = earlyContribStrategy.countTokens(payments);
        require(earlyContribStrategy.getFreeTokensInTranche(requireTokens));
        mowjowToken.mint(investor, requireTokens);
        earlyContribStrategy.soldInTranche(requireTokens);
        earlyContributors.push(investor);  
        EarlyContribPurchase(msg.sender, investor, payments, requireTokens); 
        
    }

    function addWhitelistInvestors(address investor) public onlyOwner {
        require((getState() == State.PreFunding));
        whitelistInvestors.push(investor);
    }

    /*
    * @dev Check the  
    * @return true if  
    */ 
    function isWhitelistInvestors(address preIcoInvestor) internal constant returns (bool) {
        require((getState() == State.PreFunding));
        bool hasInvestor = false;
        for (var i = 0; i < whitelistInvestors.length; i++) {
            if (whitelistInvestors[i] == preIcoInvestor) {
                hasInvestor = true;
            }
        } 
        return hasInvestor;    
    }

     /*
    * @dev Check the  
    * @return true if  
    */ 
    function isEarlyContributors(address earlyInvestor) internal constant returns (bool) {
        require((getState() == State.PreFunding));
        require(earlyInvestor != 0);
        bool hasInvestor = false;
        for (var i = 0; i < earlyContributors.length; i++) {
            if (earlyContributors[i] == earlyInvestor) {
                hasInvestor = true;
            }
        } 
        return hasInvestor;    
    }
    
    /*
    * @dev Check the sale period is still and investor's amount no zero
    * @return true if the transaction can buy tokens
    */ 
    function validPurchase() internal constant returns (bool) { 
        require(msg.value != 0);
        // uint256 requireTokens = msg.value.mul(rate); 
        // trancheStrategy.getFreeTokensInTranche(requireTokens);
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
        mowjowToken.changeStatusFinalized();
        uint256 totalTokens =  mowjowToken.INITIAL_SUPPLY();
        uint256 totalEarlyContribSoldTokens =  earlyContribStrategy.totalSoldTokens();
        uint256 totalPreIcoSoldTokens =  preIcoStrategy.totalPreIcoSoldTokens();
        uint256 totalTranchesSoldTokens = trancheStrategy.totalSoldTokens();
        //require(!earlyContribStrategy.getFreeTokensInTranche(requireTokens));
        uint256 amountTeam = totalTokens.div(10);
        uint256 amountRewardsEngine = totalTokens.div(20); 
        uint256 amountReserveFund;
  //uint256 amountReserveFund = (((totalTokens.sub(totalEarlyContribSoldTokens)).sub(totalPreIcoSoldTokens)).sub(totalTranchesSoldTokens)).sub(amountTeam).sub(amountRewardsEngine); 
        require(finalizableMowjow.doFinalization(amountReserveFund, mowjowToken, walletMultisig)); 
    }
     
}
