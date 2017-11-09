pragma solidity ^0.4.11; 

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol"; 
import "./MowjowToken.sol";


contract MowjowCrowdsale is CappedCrowdsale { 

    // The token being sold
    MowjowToken public token;
    uint256 public maxCountTokensForSaleInPeriod = 4 * 1e8;

    /**
    * Define bonus schedule of transhes.
    */
    struct BonusStrategy {

        //number of days after start the crowdsale 
        uint daysAfterStart;

        //rate of bonus for current of transhe
        uint bonus;
    }

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

    enum State {
        Unknown,
        Preparing,
        PreSaleBonus50,
        PreSaleBonus35,
        Success,
        Failure,
        PresaleFinalized,
        ICOFinalized
    }
    
    // Store BonusStrategy in a fixed array, so that it can be seen in a blockchain explorer
    BonusStrategy[5] public transhes; 
    
    uint trancheIndex;
    mapping (uint => uint256) public tokenSoldInPeriod;
    State private crowdSaleState;

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
        uint256 bonusRate = countBonus();  
        uint256 weiAmount = msg.value; 

        // calculate token amount without bonus
        uint256 tokens = weiAmount.mul(rate);

        // calculate bonus 
        uint256 bonus = tokens.mul(bonusRate).div(100);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        // total tokens amount to be created
        tokens += bonus;

        token.mint(beneficiary, tokens);
        tokenSoldInPeriod[uint(crowdSaleState)] += tokens;
        MowjowTokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

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
        bool noOverSold = isNoOverSold(msg.value); 
        bool noEnded = hasEnded();
        return nonZeroPurchase && !noEnded && noOverSold;
    }


    function isNoOverSold(uint value) internal constant returns (bool) {
        if ((tokenSoldInPeriod[uint(crowdSaleState)] + value) > maxCountTokensForSaleInPeriod) { 
            return true;
        } else {
            return false;
        }
    }

    /*
    * @dev Fetch the rate of bonus
    * @return uint256 Return rate of bonus for an investor
    */
    function countBonus() internal constant returns (uint256 bonus) {        
        for (var i = 0; i < transhes.length; i++) { 
                if ((startTime + transhes[i].daysAfterStart) >= now) {
                return transhes[i].bonus;            
            }            
        }
    }    


    function setTranshesData() internal constant {
        fillTranshesData(0 days, 50, 0);         
        fillTranshesData(15 days, 35, 1);
        fillTranshesData(30 days, 20, 2); 
        fillTranshesData(40 days, 5, 3); 
        fillTranshesData(50 days, 0, 4);         
    }  
    
    function fillTranshesData(uint daysAfterStart, uint bonus, uint index) internal constant { 
        transhes[index].daysAfterStart = daysAfterStart;
        transhes[index].bonus = bonus;
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
