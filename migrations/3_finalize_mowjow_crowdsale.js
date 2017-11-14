var FinalizableMowjowCrowdsale = artifacts.require("./FinalizableMowjowCrowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(FinalizableMowjowCrowdsale);
};
