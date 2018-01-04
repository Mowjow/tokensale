pragma solidity ^0.4.18;


/*
* @title Haltable
* @dev Base contract which allows children to implement an emergency stop mechanism.
*/
contract Haltable  {
    bool public halted = false;
    address public ownerPauseStatement;
    event Pause();
    event Unpause();

    modifier onlyOwnerPauseStatement() {
        require(ownerPauseStatement != 0);
        require(ownerPauseStatement == msg.sender);
        _;
    }

    /*
    * @dev Modifier to make a function callable only when the contract is not paused.
    */
    modifier whenNotPaused() {
        require(!halted);
        _;
    }

    /*
    * @dev Modifier to make a function callable only when the contract is paused.
    */
    modifier whenPaused() {
        require(halted);
        _;
    }

    /*
    * @dev called by the owner to pause, triggers stopped state
    */
    function halt() whenNotPaused onlyOwnerPauseStatement public {
        halted = true;
        Pause();
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unhalt() whenPaused onlyOwnerPauseStatement public {
        halted = false;
        Unpause();
    }
}