const EarlyContribStrategy = artifacts.require("./EarlyContribStrategy.sol");
const PreIcoStrategy = artifacts.require("./PreIcoStrategy.sol");
const TrancheStrategy = artifacts.require("./TrancheStrategy.sol");
const FinalizableMowjow = artifacts.require("./FinalizableMowjow.sol");
const MowjowCrowdsale = artifacts.require('MowjowCrowdsale.sol');


module.exports = async function (deployer, network, accounts) {

    let startDate = new Date('12-15-2017').getTime(); // 1510844468
    let endDate = new Date('12-30-2020').getTime(); // 1513429708

    await deployer.deploy(MowjowCrowdsale, startDate, endDate, 15000, accounts[1], 15000,
            EarlyContribStrategy.address, PreIcoStrategy.address, TrancheStrategy.address,
            FinalizableMowjow.address, {gas: 99999999, from: accounts[0]});
};
