var FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");

module.exports = function(deployer) {
  deployer.deploy(FinalizableMowjow);
};
