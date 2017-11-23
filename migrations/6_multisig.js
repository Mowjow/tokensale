var MultiSigMowjow = artifacts.require("./MultiSigMowjow.sol"); 

module.exports = async  function  (deployer, network, accounts) {
    const gasValue = { gas: 4700000 };
    const ownersMultisig =  [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5], accounts[6]]
    const confirmationsTwoThirds = ownersMultisig.length * 2/3; 
    const requiredConfirmations = Math.floor(confirmationsTwoThirds);  
    await deployer.deploy(MultiSigMowjow,ownersMultisig, requiredConfirmations, gasValue) 
};
