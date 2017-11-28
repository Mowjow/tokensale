const ether = require('./helpers/ether');
const advanceBlock = require('./helpers/advanceToBlock');
const increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;
const duration = require('./helpers/increaseTime').duration;
const latestTime = require('./helpers/latestTime');
const EVMThrow = require('./helpers/EVMThrow');

const BigNumber = web3.BigNumber;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


const MowjowCrowdsale = artifacts.require('MowjowCrowdsale');
const MowjowToken = artifacts.require('MowjowToken');
const EarlyContribStrategy = artifacts.require("EarlyContribStrategy");
const PreIcoStrategy = artifacts.require("PreIcoStrategy");
const TrancheStrategy = artifacts.require('TrancheStrategy');
const FinalizableMowjow = artifacts.require('FinalizableMowjow');

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser, secondInvestor]) {
    const cap = ether(0.1);
    const rate = new BigNumber(40000);
    const value = ether(1);

    const expectedTokenAmount = rate.mul(value).mul(1.5);

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    });

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1);
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.seconds(1);

        this.finalizableMowjow = await FinalizableMowjow.deployed();
        this.earlyContribStrategy = await EarlyContribStrategy.deployed();
        this.preIcoStrategy = await PreIcoStrategy.new(100, 80000, 40000);

        this.trancheStrategy = await TrancheStrategy.new([100, 100], [80000, 80000], [40000, 40000]);
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address);

        this.token = MowjowToken.at(await this.mowjowCrowdsale.token());
    });

    describe('payments in pre ico with 100% bonuses', function () {
        beforeEach(async function () {
            await increaseTimeTo(this.startTime)
        });

        it('should investor pay in pre ico tranche and first ico', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value: value, from: purchaser });

            const event = logs.find(e => e.event === 'Purchase');
            should.exist(event);
        });

        it('should 100% bonus in second tranche', async function () {
            const expectedValue = 80000;
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            const logs   = await this.mowjowCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            let balance = await this.token.balanceOf(investor);
            await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser });
            balance = await this.token.balanceOf(investor);
            console.log("balance0", balance);
            const event = logs.logs.find(e => e.event === 'Purchase');
            should.exist(event);
            event.args.amount.should.be.bignumber.equal(expectedValue);
        })
    })
});
