pragma solidity ^0.4.11; 


/**
* @title MultiSigMowjowMultiSigMowjow Allows multiple parties to agree on transactions before execution. 
*/
contract MultiSigMowjow { 

    event Confirmation(address indexed sender, uint indexed transactionId); 
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);

    mapping (address => bool) isOwner;
    address[] public owners;        
    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;
    uint public transactionCount;
    uint public required;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    modifier onlyWallet() {
        require(msg.sender != address(this));
        _;
    }

    modifier ownerExists(address owner) {
        require(!isOwner[owner]);
        _;
    }

    modifier notNull(address _address) {
        require(_address == 0);
        _;
    }

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination == 0);
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(transactions[transactionId].executed);           
        _;
    }

    /**
    */
    function MultiSigMowjow (address[] _owners) {
        require(_owners.length > 1);

        address lastAdd = address(0); 
        for (uint i=0; i < _owners.length; i++) {
            require(_owners[i] > lastAdd);
            isOwner[_owners[i]] = true;
            lastAdd = _owners[i];
        }
        owners = _owners;

    }

    // @dev Returns list of owners.
    // @return List of owner addresses.
    function getOwners()
        public
        constant
        returns (address[])
    {
        return owners;
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
            Transaction transaction = transactions[transactionId];
            transaction.executed = true;
            if (transaction.destination.call.value(transaction.value)(transaction.data)) {
                Execution(transactionId);
            } else {
                ExecutionFailure(transactionId);
                transaction.executed = false;
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
        transactions[transactionId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        Submission(transactionId);
    } 
     
    function () payable {}
}
