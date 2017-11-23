
var MowjowToken = artifacts.require("./MowjowToken.sol"); 

module.exports = async function(deployer) {
    const gasValue = { gas: 4700000 }; 
    await deployer.deploy(MowjowToken, gasValue);  
}; 