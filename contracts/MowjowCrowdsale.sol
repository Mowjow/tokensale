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

    uint256 public cap;

    MowjowToken mowjowToken;    
    FinalizableMowjow public finalizableMowjow;
    TrancheStrategy trancheStrategy; 
    EarlyContribStrategy earlyContribStrategy; 
    PreIcoStrategy preIcoStrategy;

    address[] public earlyContributors;
    address[] public whitelistInvestors; 

    /** State machine    
    * - PreFunding: We have not passed start time yet
    * - Funding: Active crowdsale
    * - Finalized: The finalized has been called and succesfully executed
    */
    enum State {PreFunding, Funding, Finalized, Ended}

    /*
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount amount of tokens purchased
    */
    event Purchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    /*
    * @dev The constructor function to initialize the token related properties
    * @param _startTime uint256     Specifies the start date of the presale
    * @param _endTime   uint256     Specifies the end date of the ICO
    * @param _rate      uint256     Specifies how many token units a buyer gets per wei
    * @param _wallet    address     Specifies address where funds are collected
    *     Specifies total count of ether
    */
    function MowjowCrowdsale(
        uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap,
        EarlyContribStrategy _earlyContribStrategy, PreIcoStrategy _preIcoStrategy,
        TrancheStrategy _trancheStrategy, FinalizableMowjow _finalizableMowjow
        ) Crowdsale(_startTime, _endTime, 1, _wallet) {

        require(_cap > 0);

        finalizableMowjow = _finalizableMowjow;
        trancheStrategy = _trancheStrategy;
        preIcoStrategy = _preIcoStrategy;
        earlyContribStrategy = _earlyContribStrategy;

        trancheStrategy.setEndDate(endTime);
        preIcoStrategy.setEndDate(endTime);

        cap = _cap;
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
    * @dev This method has been overridden  from  crowdsale
    */ 
    function buyTokens(address beneficiary) public payable {

        require(beneficiary != 0x0);
        require(msg.value > 0);

        State currentState = getState();
        PricingStrategy strategy;

        if(currentState == State.PreFunding) {
            bool isValid = isInList(beneficiary, whitelistInvestors);
            require(isValid);
            strategy = preIcoStrategy;
        } else if(currentState == State.Funding) {
            strategy = trancheStrategy;
        }
        uint256 tokensAmount = strategy.countTokens(msg.value);
        mowjowToken.mint(beneficiary, tokensAmount);
        weiRaised = weiRaised.add(msg.value);

        forwardFunds();
        Purchase(msg.sender, beneficiary, msg.value, tokensAmount);
    }

    /**
    *   overriding Crowdsale hasEnded to add cap logic
    *   @return boolean Return true if crowdsale event has ended
    */
    function hasEnded() public constant returns (bool) {
        bool capReached = weiRaised == cap;
        return super.hasEnded() || capReached;
    }

    /**
    * @dev Crowdsale state machine management.
    */
    function getState() public constant returns (State) {
        if (isFinalized) {
            return State.Finalized;
        }
        else if (preIcoStrategy.isNoEmptyPreIcoTranche()) {
            return State.PreFunding;
        }
        else if (trancheStrategy.isNoEmptyTranches()) {
            return State.Funding;
        }
        else {
            return State.Ended;
        }
    }

    /*
    *  @dev Add Early contributor to list and to mint tokens for him (only in the presale time)
    *  @param investor address Early contributor's address
    *  @param payments uint256 Early contributor's payments in ether
    */
    function addEarlyContributors(address investor, uint256 payments) public onlyOwner {
        State currentState = getState();
        require(currentState == State.PreFunding);

        uint256 tokensAmount = earlyContribStrategy.countTokens(payments);
        mowjowToken.mint(investor, tokensAmount);
        earlyContribStrategy.soldInTranche(tokensAmount);

        earlyContributors.push(investor);
        Purchase(msg.sender, investor, payments, tokensAmount);
    }

    /*
   *  @dev Add Whitelist investor to list
   *  @param investor address Whitelist investor's address
   */
    function addWhitelistInvestors(address investor) public onlyOwner {
        require((getState() == State.PreFunding));
        whitelistInvestors.push(investor);
    }

    /*
    * @dev Check if address is in early contributors
    * @param investor address Early contributors's address
    * @param list address[] Early contributors's addresses
    * @return boolean Return true if current investor's address is in to list
    */
    function isInList(address investor, address[] list) internal constant returns (bool) {
        State state = getState();
        require(state == State.PreFunding);
        require(investor != 0);

        bool hasInvestor = false;
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == investor) {
                hasInvestor = true;
            }
        }

        return hasInvestor;
    }
    
    /*
    * @dev Check the sale period is still and investor's amount no zero
    * @return boolean Return true if this payment is avalable
    */
    function validPurchase() internal constant returns (bool) { 
        require(msg.value > 0);

        bool ended = hasEnded();
        return !ended;
    }    

    /*
    * @dev Creates the token to be sold.
    * @returns MintableToken Return instance of the MowjowToken
    */
    function createTokenContract() internal returns (MintableToken) {
        mowjowToken = new MowjowToken('MowjowToken', 'MJT', 18, 75 * 1e8);

        return mowjowToken;
    }

    /*
    * @dev Send ether to the fund collection wallet
    */
    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    /*
    * @dev The overriding function from zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol 
    * should call super.finalization() to ensure the chain of finalization is executed entirely.
    * Calculate and send tokens to funds from whitelist paper
    */
    function finalization() internal {
        mowjowToken.changeStatusFinalized();
        uint256 totalTokens =  mowjowToken.totalSupply();
        uint256 earlyContributorsTokens =  earlyContribStrategy.totalSoldTokens();
        uint256 preIcoTokens =  preIcoStrategy.totalPreIcoSoldTokens();
        uint256 trancheTokens = trancheStrategy.totalSoldTokens();

        uint256 teamBonuses = totalTokens.div(10);
        uint256 rewardsEngineTokens = totalTokens.div(10);
        uint256 longTermReserve;

        longTermReserve = totalTokens.sub(earlyContributorsTokens);
        longTermReserve = longTermReserve.sub(preIcoTokens);
        longTermReserve = longTermReserve.sub(trancheTokens);
        longTermReserve = longTermReserve.sub(teamBonuses);
        longTermReserve = longTermReserve.sub(rewardsEngineTokens);

        uint256 sumOfTokens = longTermReserve.add(teamBonuses).add(rewardsEngineTokens);
        token.mint(msg.sender, sumOfTokens);

        require(finalizableMowjow.doFinalization(longTermReserve,
            rewardsEngineTokens, teamBonuses));
    }
     
}
