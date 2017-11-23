var FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");

module.exports = function(deployer, network, accounts) {
  const gasValue = { gas: 4700000 };
  deployer.deploy(FinalizableMowjow, accounts[1], gasValue);
};
