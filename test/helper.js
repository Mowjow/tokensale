exports.ether = require('./helpers/ether');
exports.advanceBlock = require('./helpers/advanceToBlock');
exports.increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;
exports.duration = require('./helpers/increaseTime').duration;
exports.latestTime = require('./helpers/latestTime');
exports.EVMThrow = require('./helpers/EVMThrow');
exports.EVMRevert = require('./helpers/EVMRevert');
exports.BigNumber = web3.BigNumber;
exports.should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(this.BigNumber))
    .should();

const MowjowCrowdsale = artifacts.require('MowjowCrowdsale'),
    MowjowToken = artifacts.require('MowjowToken'),
    EarlyContribStrategy = artifacts.require("EarlyContribStrategy"),
    PreIcoStrategy = artifacts.require("PreIcoStrategy"),
    TrancheStrategy = artifacts.require('TrancheStrategy'),
    FinalizableMowjow = artifacts.require('FinalizableMowjow'),
    MultiSigMowjow = artifacts.require('MultiSigMowjow'),
    MowjowFunds = artifacts.require('MowjowFunds');

exports.setupCrowdsaleSuite = async function(setupParams, crowdsaleParams, _, wallet) {
    const preIcoStrategy = await PreIcoStrategy.new(
        setupParams.pre_ico.bonus,
        setupParams.pre_ico.amount,
        setupParams.pre_ico.rate
    );

    const trancheStrategy = await TrancheStrategy.new(
        setupParams.tranche_strategy.bonus,
        setupParams.tranche_strategy.amount,
        setupParams.tranche_strategy.rate
    );

    const mowjowFunds = await MowjowFunds.new();
    const finalizableMowjow = await FinalizableMowjow.new(mowjowFunds.address);

    await preIcoStrategy.setEndDate(crowdsaleParams.end_time);
    await trancheStrategy.setEndDate(crowdsaleParams.end_time);

    const earlyContribStrategy = await EarlyContribStrategy.new(
        setupParams.early_contributors.bonus, setupParams.early_contributors.amount,
        setupParams.early_contributors.rate
    );

    const mowjowCrowdsale = await MowjowCrowdsale.new(
        crowdsaleParams.start_time, crowdsaleParams.end_time,
        crowdsaleParams.rate, wallet, crowdsaleParams.cap,
        earlyContribStrategy.address, preIcoStrategy.address,
        trancheStrategy.address, finalizableMowjow.address
    );

    const mowjowCrowdsaleAddress = mowjowCrowdsale.address;
    await preIcoStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
    await trancheStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
    await earlyContribStrategy.setCrowdsaleAddress(mowjowCrowdsaleAddress);
    await finalizableMowjow.setCrowdsaleAddress(mowjowCrowdsaleAddress);

    const actionOwners = [finalizableMowjow.address, _];
    await mowjowFunds.setActionOwners(actionOwners, {from: _});

    const tokenInstance = await mowjowCrowdsale.token();
    const token = await MowjowToken.at(tokenInstance);

    return [mowjowCrowdsale, finalizableMowjow, token];
};