var testData = require("./config.json");
var MultiSigMowjow = artifacts.require('MultiSigMowjow');


module.exports = async function (deployer, network, accounts) {
    const ownersMultisig = [accounts[1], accounts[2], accounts[3], accounts[4], accounts[5], accounts[6]];
    const confirmationsTwoThirds = ownersMultisig.length * 2 / 3;
    const requiredConfirmations = Math.floor(confirmationsTwoThirds);
    deployer.deploy(MultiSigMowjow, ownersMultisig, requiredConfirmations, { "gas": 47000000 })
};
