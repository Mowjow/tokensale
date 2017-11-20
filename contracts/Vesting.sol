pragma solidity ^0.4.11;
 
import "zeppelin-solidity/contracts/math/SafeMath.sol"; 
import "zeppelin-solidity/contracts/math/Math.sol";
import "zeppelin-solidity/contracts/token/LimitedTransferToken.sol";  
//import "zeppelin-solidity/contracts/token/ERC20Basic.sol"; 

contract Vesting is  LimitedTransferToken { 
    using SafeMath for uint256; 

    struct TokenGrant {
        address granter;     // 20 bytes
        uint256 value;       // 32 bytes
        uint256 cliff;
        uint256 vesting;
        uint256 start;        // 3 * 8 = 24 bytes
        bool revokable;
        bool burnsOnRevoke;  // 2 * 1 = 2 bits? or 2 bytes?
    } // total 78 bytes = 3 sstore per operation (32 per sstore)

    mapping (address => TokenGrant[]) public grants;

    event NewTokenGrant(address indexed from, address indexed to, uint256 value, uint256 grantId); 

    /**
    * @dev Grant tokens to a specified address
    * @param _to address The address which the tokens will be granted to.
    * @param _value uint256 The amount of tokens to be granted.
    * @param _start uint256 Time of the beginning of the grant.
    * @param _cliff uint256 Time of the cliff period.
    * @param _vesting uint256 The vesting period.
    */
    function grantVestedTokens(
        address _to,
        uint256 _value,
        uint256 _start,
        uint256 _cliff,
        uint256 _vesting,
        bool _revokable,
        bool _burnsOnRevoke
    ) public { 
        uint256 count = grants[_to].push(
                    TokenGrant(
                    _revokable ? msg.sender : 0, // avoid storing an extra 20 bytes when it is non-revokable
                    _value,
                    _cliff,
                    _vesting,
                    _start,
                    _revokable,
                    _burnsOnRevoke
                    )
                );
        transfer(_to, _value);

        NewTokenGrant(msg.sender, _to, _value, count - 1);
    }

    /**
    * @dev Revoke the grant of tokens of a specifed address.
    * @param _holder The address which will have its tokens revoked.
    * @param _grantId The id of the token grant.
    */
    function revokeTokenGrant(address _holder, uint256 _grantId) public { 
    }

    /**
    * @dev Calculate the total amount of transferable tokens of a holder at a given time
    * @param holder address The address of the holder
    * @param time uint256 The specific time.
    * @return An uint256 representing a holder's total amount of transferable tokens.
    */
    function transferableTokens(address holder, uint64 time) public constant returns (uint256) {
        uint256 grantIndex = tokenGrantsCount(holder);
        if (grantIndex == 0) return super.transferableTokens(holder, time); // shortcut for holder without grants

            // Iterate through all the grants the holder has, and add all non-vested tokens
        uint256 nonVested = 0;
        for (uint256 i = 0; i < grantIndex; i++) {
            nonVested = SafeMath.add(nonVested, nonVestedTokens(grants[holder][i], time));
        }

        // Balance - totalNonVested is the amount of tokens a holder can transfer at any given time
        uint256 vestedTransferable = SafeMath.sub(balanceOf(holder), nonVested);

        // Return the minimum of how many vested can transfer and other value
        // in case there are other limiting transferability factors (default is balanceOf)
        return Math.min256(vestedTransferable, super.transferableTokens(holder, time));
    }    

    /**
    * @dev Check the amount of grants that an address has.
    * @param _holder The holder of the grants.
    * @return A uint256 representing the total amount of grants.
    */
    function tokenGrantsCount(address _holder) public constant returns (uint256 index) {
        return grants[_holder].length;
    }

    /**
    * @dev Calculate amount of vested tokens at a specific time
    * @param tokens uint256 The amount of tokens granted
    * @param time uint256 The time to be checked
    * @param start uint256 The time representing the beginning of the grant
    * @param cliff uint256  The cliff period, the period before nothing can be paid out
    * @param vesting uint256 The vesting period
    * @return An uint256 representing the amount of vested tokens of a specific grant
    *  transferableTokens
    *   |                         _/--------   vestedTokens rect
    *   |                       _/
    *   |                     _/
    *   |                   _/
    *   |                 _/
    *   |                /
    *   |              .|
    *   |            .  |
    *   |          .    |
    *   |        .      |
    *   |      .        |
    *   |    .          |
    *   +===+===========+---------+----------> time
    *      Start       Cliff    Vesting
    */
    function calculateVestedTokens(
        uint256 tokens,
        uint256 time,
        uint256 start,
        uint256 cliff,
        uint256 vesting) public constant returns (uint256)
        {
            // Shortcuts for before cliff and after vesting cases.
            if (time < cliff) return 0;
            if (time >= vesting) return tokens;

            // Interpolate all vested tokens.
            // As before cliff the shortcut returns 0, we can use just calculate a value
            // in the vesting rect (as shown in above's figure)

            // vestedTokens = (tokens * (time - start)) / (vesting - start)
            uint256 vestedTokens = SafeMath.div(
                                            SafeMath.mul(
                                            tokens,
                                            SafeMath.sub(time, start)
                                            ),
                                            SafeMath.sub(vesting, start)
                                            );

            return vestedTokens;
        } 

    /**
    * @dev Calculate the date when the holder can transfer all its tokens
    * @param holder address The address of the holder
    * @return An uint256 representing the date of the last transferable tokens.
    */
    function lastTokenIsTransferableDate(address holder) public constant returns (uint256 date) {
        date = now;
        uint256 grantIndex = grants[holder].length;
        for (uint256 i = 0; i < grantIndex; i++) {
            date = Math.max256(grants[holder][i].vesting, date);
        }
    }

    /**
    * @dev Get the amount of vested tokens at a specific time.
    * @param grant TokenGrant The grant to be checked.
    * @param time The time to be checked
    * @return An uint256 representing the amount of vested tokens of a specific grant at a specific time.
    */
    function vestedTokens(TokenGrant grant, uint256 time) private constant returns (uint256) {
        return calculateVestedTokens(
        grant.value,
        uint256(time),
        uint256(grant.start),
        uint256(grant.cliff),
        uint256(grant.vesting)
        );
    }

    /**
    * @dev Calculate the amount of non vested tokens at a specific time.
    * @param grant TokenGrant The grant to be checked.
    * @param time uint256 The time to be checked
    * @return An uint256 representing the amount of non vested tokens of a specific grant on the
    * passed time frame.
    */
    function nonVestedTokens(TokenGrant grant, uint256 time) private constant returns (uint256) {
        return grant.value.sub(vestedTokens(grant, time));
    }

}
