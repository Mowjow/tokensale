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
    //address public walletMultisig = 0x12345;
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
    enum State {PreFunding, Funding, Finalized}

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
    * @param _cap       uint256     Specifies total count of tokens
    */
    function MowjowCrowdsale(
        uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, uint256 _cap,
        EarlyContribStrategy _earlyContribStrategy, PreIcoStrategy _preIcoStrategy,
        TrancheStrategy _trancheStrategy, FinalizableMowjow _finalizableMowjow
        ) Crowdsale(_startTime, _endTime, 1, _wallet) { // We don't need rate as we are using PricingStrategies

        require(_cap > 0);

        finalizableMowjow = _finalizableMowjow;
        trancheStrategy = _trancheStrategy;
        preIcoStrategy = _preIcoStrategy;
        earlyContribStrategy = _earlyContribStrategy;
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

    function() payable {
        throw;
    }

    event IsOk(bool ok);
    /*
    * @dev This method has been overridden  from  crowdsale
    */ 
    function buyTokens(address beneficiary) public payable {

        require(beneficiary != 0x0);
        require(msg.value > 0);

        State currentState = getState();
        IsOk(true);
        PricingStrategy strategy;
        IsOk(true);
        bool isValid = true;

//        if(currentState == State.PreFunding) {
//            isValid = isInList(beneficiary, whitelistInvestors);
//            strategy = preIcoStrategy;
//        } else if(currentState == State.Funding) {
//            isValid = validPurchase();
//            strategy = trancheStrategy;
//        }
//
//        require(isValid);
//
        weiRaised = weiRaised.add(msg.value);
        uint256 tokensAmount = preIcoStrategy.countTokens(msg.value);
        mowjowToken.mint(beneficiary, tokensAmount);
//
//        Purchase(msg.sender, beneficiary, msg.value, tokensAmount);
        forwardFunds();
    }

    /**
    *   overriding Crowdsale hasEnded to add cap logic
    *   @return true if crowdsale event has ended
    */
    function hasEnded() public constant returns (bool) {
        bool capReached = weiRaised >= cap;
        return super.hasEnded() || capReached;
    }

    /**
    * Crowdsale state machine management.
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
    }

    function addEarlyContributors(address investor, uint256 payments) public onlyOwner {
        bool inList = isInList(investor, earlyContributors);
        require(!inList);

        State currentState = getState();
        require(currentState == State.PreFunding);

        uint256 tokensAmount = earlyContribStrategy.countTokens(payments);
        bool contrib = earlyContribStrategy.getFreeTokensInTranche(tokensAmount);
        require(contrib);

        mowjowToken.mint(investor, tokensAmount);
        earlyContributors.push(investor);
        Purchase(msg.sender, investor, payments, tokensAmount);
    }

    function addWhitelistInvestors(address investor) public onlyOwner {
        require((getState() == State.PreFunding));
        whitelistInvestors.push(investor);
    }

    /*
    * @dev Check if address is in early contributors
    * @return boolean
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
    * @return boolean
    */ 
    function validPurchase() internal constant returns (bool) { 
        require(msg.value != 0);
        require(!hasEnded()); 
        return true; 
    }    

    /*
    * @dev Creates the token to be sold.
    * @returns MintableToken
    */
    function createTokenContract() internal returns (MintableToken) {
        mowjowToken = new MowjowToken('MowjowToken', 'MJT', 18, 75 * 1e8);

        return mowjowToken;
    }

    // send ether to the fund collection wallet
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
//        uint256 totalTokens =  mowjowToken.INITIAL_SUPPLY();
//        uint256 eContrTok =  earlyContribStrategy.totalSoldTokens();
//        uint256 preIcoTok =  preIcoStrategy.totalPreIcoSoldTokens();
//        uint256 tranchTok = trancheStrategy.totalSoldTokens();
//        //require(!earlyContribStrategy.getFreeTokensInTranche(requireTokens));
//        uint256 teamTok = totalTokens.div(10);
//        uint256 rewEngTok = totalTokens.div(20);
//        uint256 reserveFundTok;
//
//        //calculate tokens for reserve fund
//        reserveFundTok = totalTokens.sub(eContrTok);
//        reserveFundTok = reserveFundTok.sub(preIcoTok);
//        reserveFundTok = reserveFundTok.sub(tranchTok);
//        reserveFundTok = reserveFundTok.sub(teamTok);
//        reserveFundTok = reserveFundTok.sub(rewEngTok);
//        require(finalizableMowjow.doFinalization(reserveFundTok, mowjowToken));
    }
     
}
