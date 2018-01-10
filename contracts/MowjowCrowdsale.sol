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
    TrancheStrategy public trancheStrategy;
    EarlyContribStrategy public earlyContribStrategy;
    PreIcoStrategy public preIcoStrategy;

    address[] public earlyContributors;
    address[] public whitelistInvestors;
    address[] public mowjowInvestors;
    address[] public mowjowManagers;

    /*
    *  modifier for valid accounts of managers and for the owner of the contract
    */
    modifier onlyManagers() {
        require(!isNewAccount(msg.sender, mowjowManagers) || msg.sender == owner);
        _;
    }

    /** State machine
    * - PreFunding: We have not passed start time yet
    * - Funding: Active crowdsale
    * - Finalized: The finalized has been called and successfully executed
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
    ) Crowdsale(_startTime, _endTime, 1, _wallet) public {

        require(_cap > 0);

        finalizableMowjow = _finalizableMowjow;
        trancheStrategy = _trancheStrategy;
        preIcoStrategy = _preIcoStrategy;
        earlyContribStrategy = _earlyContribStrategy;
        cap = _cap;
    }

    function changeTrancheStrategy(TrancheStrategy _strategy) public onlyOwner {
        trancheStrategy = _strategy;
    }

    function changePreIcoStrategy(PreIcoStrategy _strategy) public onlyOwner {
        preIcoStrategy = _strategy;
    }

    function changeEarlyContribStrategy(EarlyContribStrategy _strategy) public onlyOwner {
        earlyContribStrategy = _strategy;
    }


    /*
    * @dev This method has been overridden from crowdsale
    * buying tokens for any price strategy
    */
    function buyTokens(address _beneficiary) public payable {
        require(_beneficiary != 0x0);
        require(msg.value > 0);

        State currentState = getState();
        PricingStrategy strategy;
        bool isValid;
        if(currentState == State.PreFunding) {
            isValid = !isNewAccount(_beneficiary, whitelistInvestors);
            require(isValid);
            strategy = preIcoStrategy;
        } else if(currentState == State.Funding) {
            isValid = !isNewAccount(_beneficiary, mowjowInvestors);
            require(isValid);
            strategy = trancheStrategy;
        }

        uint256 tokensAmount = strategy.countTokens(msg.value);
        mowjowToken.mint(_beneficiary, tokensAmount);
        weiRaised = weiRaised.add(msg.value);
        forwardFunds();
        Purchase(msg.sender, _beneficiary, msg.value, tokensAmount);

    }

    /**
    *   overriding Crowdsale hasEnded to add cap logic
    *   @return boolean Return true if crowdsale event has ended
    */
    function hasEnded() public constant returns (bool) {
        bool capReached = weiRaised >= cap;
        return super.hasEnded() || capReached;
    }

    /**
    * @dev Crowdsale state machine management.
    */
    function getState() public constant returns (State) {
        if (isFinalized) {
            return State.Finalized;
        }
        else if (preIcoStrategy.isNoEmptyTranches()) {
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
    *  @param _investor address Early contributor's address
    *  @param _payments uint256 Early contributor's payments in ether
    */
    function addEarlyContributors(address _investor, uint256 _payments) public onlyManagers {
        State currentState = getState();

        require(isNewAccount(_investor, earlyContributors));
        require(currentState == State.PreFunding);

        uint256 tokensAmount = earlyContribStrategy.countTokens(_payments);
        mowjowToken.mint(_investor, tokensAmount);

        earlyContributors.push(_investor);
        Purchase(msg.sender, _investor, _payments, tokensAmount);
    }

    /*
    *  @dev Add Whitelist investor to list
    *  @param _investor address Whitelist investor  address
    */
    function addWhitelistInvestors(address _investor) public onlyManagers {
        require(isNewAccount(_investor, whitelistInvestors));
        require((getState() == State.PreFunding));
        whitelistInvestors.push(_investor);
    }

    /*
    *  @dev Add mowjow investor to list
    *  @param _investor address mowjow investor  address
    */
    function addMowjowInvestors(address _investor) public onlyManagers {
        require(isNewAccount(_investor, mowjowInvestors));
        mowjowInvestors.push(_investor);
    }

    /*
    *  @dev Add mowjow administrator to list
    *  @param _manager address mowjow manager address
    */
    function addManager(address _manager) public onlyOwner {
        require(isNewAccount(_manager, mowjowManagers));
        mowjowManagers.push(_manager);
    }

    /*
    *  @dev Check address in list
    *  @return boolean Return true if the account is new for the list
    */
    function isNewAccount(address _account, address[] _list) internal constant returns (bool) {
        require(_account != 0);
        bool newAccount = true;
        for (uint256 i = 0; i < _list.length; i++) {
            if(_list[i] == _account) {
                newAccount = false;
            }
        }
        return newAccount;
    }

    /*
    * @dev Check the sale period is still and investor's amount no zero
    * @return boolean Return true if this payment is available
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
        mowjowToken.setOwnerPauseStatement(owner);
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
        uint256 totalTokens =  mowjowToken.initialSupply();
        totalTokens = totalTokens.mul(1e18);

        uint256 earlyContributorsTokens =  earlyContribStrategy.totalSoldTokens();
        uint256 preIcoTokens =  preIcoStrategy.totalSoldTokens();
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
