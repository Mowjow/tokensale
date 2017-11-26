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
const PURCHASE_EVENT = 'Purchase';

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {
    const cap = ether(0.1);
    const rate = new BigNumber(40000);
    const value = ether(0.0000000000000001);

    const expectedTokenAmount = rate.mul(value).mul(2); // 100% bonus

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    });

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1);
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.weeks(1);

        this.finalizableMowjow = await FinalizableMowjow.deployed();
        this.earlyContribStrategy = await EarlyContribStrategy.deployed();
        this.preIcoStrategy = await PreIcoStrategy.deployed();
        this.trancheStrategy = await TrancheStrategy.deployed();
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address);

        const tokenAddress = await this.mowjowCrowdsale.token();
        this.token = MowjowToken.at(tokenAddress);
    });

    describe('payments for early contributors', function () {
        beforeEach(async function () {
            // increaseTimeTo(this.startTime - duration.days(1))
        });

        it('should add investor to early contributor list successfuly', async function () {
            const { logs }= await this.mowjowCrowdsale.addEarlyContributors(investor, value);

            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event)
        });

        it('should 100% bonus for early contributor', async function () {
            const { logs } = await this.mowjowCrowdsale.addEarlyContributors(investor, value);
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(value);
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
            const balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(expectedTokenAmount)
        });

        // it('should reject add to early contributor list after end pre ico', async function () {
        //     increaseTimeTo(this.afterEndTime);
        //     await this.mowjowCrowdsale.addEarlyContributors(investor, value).should.be.rejectedWith(EVMThrow)
        // })
    })
});
