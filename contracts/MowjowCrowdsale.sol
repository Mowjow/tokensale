pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "./MowjowToken.sol";


contract MowjowCrowdsale is CappedCrowdsale { 

    // The token being sold
    MowjowToken public token;

    uint public dayHalfPresaleBonus35 = 15 days;
    uint public dayStartIcoBonus20 = 30 days;
    uint public dayStartIcoBonus5 = 40 days;
    uint public dayStartIcoBonus0 = 50 days;

    /*
    * State mashine
    *   - Unknown:          Default Initial State of Contract
    *   - Preparing:        All contract initialization calls
    *   - PreSale:          We are into PreSale period
    *   - ICO:              The real Sale of Tokens, after pre sale
    *   - Success:          Minimum funding goal reached
    *   - Failure:          Minimum funding goal not reached
    *   - PresaleFinalized: The PreSale has been concluded
    *   - ICOFinalized:     The ICO has finished
    */
    enum State {Unknown, Preparing, PreSaleBonus50, PreSaleBonus35, ICOBonus20, ICOBonus5, ICOBonus0, Success, Failure, PresaleFinalized, ICOFinalized}
    
    State public crowdSaleState;

    /*
    * @dev Modifier to check that amount transfered is not 0
    */
    modifier nonZero() {
        require(msg.value != 0);
        _;
    }

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
    }

    /*
    * @dev This method have  overrided  from  crowdsale
    */ 
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != 0x0);
        require(validPurchase()); 
        uint256 bonusRate = countBonus(crowdSaleState); 
        uint256 weiAmount = msg.value;
        bonusRate = bonusRate.div(100);

        // calculate token amount without bonus
        uint256 tokens = weiAmount.mul(rate);

        // calculate bonus 
        uint256 bonus = tokens.mul(bonusRate);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        // total tokens amount to be created
        tokens += bonus;

        token.mint(beneficiary, tokens);
        MowjowTokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

        forwardFunds();
    }

    /**
    * @dev Check the sale period is still and investor's amount no zero
    * @return true if the transaction can buy tokens
    */ 
    function validPurchase() internal constant returns (bool) { 
        bool nonZeroPurchase = msg.value != 0;
        bool withinPeriod = isCrowdSalePeriod();
        return withinPeriod && nonZeroPurchase;
    }

    /**
    * @dev Check if the sale period is still on and change state crowdsale
    * @return bool Return true if the contract is in pre sale period
    */
    function isCrowdSalePeriod() internal constant returns (bool) { 
        if (now <= (startTime + dayHalfPresaleBonus35) && now >= startTime) {
            crowdSaleState = State.PreSaleBonus50;
            return true;
        }
        if (now <= (startTime + dayStartIcoBonus20) && now >= (startTime + dayHalfPresaleBonus35)) {
            crowdSaleState = State.PreSaleBonus35;
            return true;
        }
        if (now <= (startTime + dayStartIcoBonus5) && now >= (startTime + dayStartIcoBonus20)) { 
            crowdSaleState = State.ICOBonus20;
            return true;
        }  
        if (now <= (startTime + dayStartIcoBonus0) && now >= (startTime + dayStartIcoBonus5)) { 
            crowdSaleState = State.ICOBonus5;
            return true;
        } 
        if (now <= (endTime) && now >= (startTime + dayStartIcoBonus0)) {
            crowdSaleState = State.ICOBonus0;
            return true;
        } else {
            return false;
        }          
    }

    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countBonus(State state) internal constant returns (uint256 bonus) {
        if (state == State.PreSaleBonus50) return 50;
        if (state == State.PreSaleBonus35) return 35;
        if (state == State.ICOBonus20) return 20;
        if (state == State.ICOBonus5) return 5;
        if (state == State.ICOBonus0) return 0;
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

}
