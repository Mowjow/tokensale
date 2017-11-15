const ether = require('./ether')
const advanceBlock = require('./advanceToBlock')
const increaseTimeTo = require('./increaseTime').increaseTimeTo
const duration = require('./increaseTime').duration
const latestTime = require('./latestTime')
const EVMThrow = require('./EVMThrow')

const BigNumber = web3.BigNumber;
const value = ether(0.000001);
const rate = new BigNumber(20000);

const data = {

    should: require('chai')
        .use(require('chai-as-promised'))
        .use(require('chai-bignumber')(BigNumber))
        .should(),

    MowjowCrowdsale: artifacts.require('MowjowCrowdsale'),
    MowjowToken: artifacts.require('MowjowToken'),
    TrancheStrategy: artifacts.require('TrancheStrategy'),
    FinalizableMowjowCrowdsale: artifacts.require('FinalizableMowjowCrowdsale'),
    cap: ether(5),
    lessThanCap: ether(1),
    rate: rate,
    value: value,
    expectedTokenAmount: rate.mul(value)
}
exports.data = data;

exports.advanceBlock = advanceBlock;
const stateTime = {
    startTime: latestTime() + duration.weeks(1),
    periodBonus35: this.startTime + duration.days(15),
    periodBonus20: this.startTime + duration.days(30),
    periodBonus5: this.startTime + duration.days(40),
    periodBonus0: this.startTime + duration.days(50),
    endTime: this.startTime + duration.weeks(8),
    afterEndTime: this.endTime + duration.seconds(1)
}
exports.stateTime = stateTime;
const contracts = {
    finalizableMowjowCrowdsale: data.FinalizableMowjowCrowdsale.deployed(),
    trancheStrategy: data.TrancheStrategy.deployed(),
    mowjowCrowdsale: data.MowjowCrowdsale.new(this.startTime, this.endTime, rate, data.TrancheStrategy.address/*wallet*/, data.cap, data.TrancheStrategy.address, data.FinalizableMowjowCrowdsale.address)

}
exports.contracts = contracts;
