pragma solidity ^0.4.11; 


/**
* @title MultiSigMowjowMultiSigMowjow Allows multiple parties to agree on transactions before execution. 
*/
contract MultiSigMowjow { 

    event Confirmation(address indexed sender, uint indexed transactionId); 
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
    event Deposit(address indexed sender, uint value);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint required);
    event OwnerAddition1(address indexed owner); 

    mapping (address => bool) isOwner;
    address[] public owners;        
    mapping (uint => TransactionMultisig) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;
    uint public transactionCount;
    uint public required;

    struct TransactionMultisig {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    modifier onlyWallet() {
        require(msg.sender == address(this));
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner]);
        _;
    }

    modifier notNull(address _address) {
        require(_address != 0);
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner]);
        _;
    }

    modifier validRequirement(uint ownerCount, uint _required) {
        require(_required < ownerCount || _required != 0 || ownerCount != 0);
        _;
    }

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != 0);
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);           
        _;
    }

    /* @dev Contract constructor sets initial owners and required number of confirmations.
    * @param _owners List of initial owners.
    * @param _required Number of required confirmations.
    */
    function MultiSigMowjow (address[] _owners, uint _required) public {
        require(_owners.length > 1);

        for (uint i = 0; i < _owners.length; i++) {
            require(isOwner[_owners[i]] || _owners[i] != 0); 
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _required;

    }

    /* @dev Returns list of owners.
    *  @return List of owner addresses.
    */
    function getOwners()
        public
        constant
        returns (address[])
    {
        return owners;
    }

    /// @dev Allows to add a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of new owner.
    function addOwner(address owner)
        public
        onlyWallet
        ownerDoesNotExist(owner)
        notNull(owner)
        validRequirement(owners.length + 1, required)
    {
        isOwner[owner] = true;
        owners.push(owner);
        OwnerAddition1(address(this));
        OwnerAddition(owner);
    }

    /// @dev Allows to remove an owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner.
    function removeOwner(address owner)
        public
        onlyWallet
        ownerExists(owner)
    {
        isOwner[owner] = false;
        for (uint i=0; i < owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        owners.length -= 1;
        if (required > owners.length)
            changeRequirement(owners.length);
        OwnerRemoval(owner);
    }

    /// @dev Allows to change the number of required confirmations. Transaction has to be sent by wallet.
    /// @param _required Number of required confirmations.
    function changeRequirement(uint _required)
        public
        onlyWallet
        validRequirement(owners.length, _required)
    {
        required = _required;
        RequirementChange(_required);
    }

    // @dev Allows an owner to submit and confirm a transaction.
    // @param destination Transaction target address.
    // @param value Transaction ether value.
    // @param data Transaction data payload.
    // @return Returns transaction ID.
    function submitTransaction(address destination, uint value, bytes data)
        public
        returns (uint transactionId)
    {
        transactionId = addTransaction(destination, value, data); 
        confirmTransaction(transactionId);
    }

    // @dev Allows an owner to confirm a transaction.
    // @param transactionId Transaction ID.
    function confirmTransaction(uint transactionId)
        public
        ownerExists(msg.sender)
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    // @dev Allows anyone to execute a confirmed transaction.
    // @param transactionId Transaction ID.
    function executeTransaction(uint transactionId)
        public
        notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            TransactionMultisig storage tsn = transactions[transactionId];
            tsn.executed = true;
            if (tsn.destination.call.value(tsn.value)(tsn.data)) {
                Execution(transactionId);
            } else {
                ExecutionFailure(transactionId);
                tsn.executed = false;
            }           
            
        }
    }

    // @dev Returns the confirmation status of a transaction.
    // @param transactionId Transaction ID.
    // @return Confirmation status.
    function isConfirmed(uint transactionId)
        public
        constant
        returns (bool)
    {
        uint count = 0;
        for (uint i=0; i < owners.length; i++) {
            if (confirmations[transactionId][owners[i]])
                count += 1;
            if (count == required)
                return true;
        }
    }

    /*
    * Internal functions
    */
    // @dev Adds a new transaction to the transaction mapping, if transaction does not exist yet.
    // @param destination Transaction target address.
    // @param value Transaction ether value.
    // @param data Transaction data payload.
    // @return Returns transaction ID.
    function addTransaction(address destination, uint value, bytes data)
        internal
        notNull(destination)
        returns (uint transactionId)
    {
        transactionId = transactionCount;
        transactions[transactionId] = TransactionMultisig({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        Submission(transactionId);
    } 
     
    
    /// @dev Fallback function allows to deposit ether.
    function () public  payable {
        if (msg.value > 0)
            Deposit(msg.sender, msg.value);
    }
}
