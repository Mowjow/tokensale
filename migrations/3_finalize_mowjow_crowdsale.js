var FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");

module.exports = function(deployer) {
  const gasValue = { gas: 800000000 };
  deployer.deploy(FinalizableMowjow, gasValue);
};
