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
        this.preIcoStrategy = await PreIcoStrategy.new(100, 80000, 40000);
        this.trancheStrategy = await TrancheStrategy.new([100], [80000], [40000]);
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address);

        let token = await this.mowjowCrowdsale.token();
        this.token = await MowjowToken.at(token);
    });
    
    describe('creating a valid crowdsale', function () {

        it('should fail with zero cap', async function () {
            await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, 0).should.be.rejectedWith(EVMThrow);
        })

    });

    describe('accepting payments', function () {


        beforeEach(async function () {
            //increaseTimeTo(this.startTime)
        });

        it('should be token owner', async function () {
            const owner = await this.token.owner();
            owner.should.equal(this.mowjowCrowdsale.address)
        });

        it('should reject payments when amount of investor is zero', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, { value: 0, from: purchaser }).should.be.rejectedWith(EVMThrow)
        });

        it('should be ended only after end date', async function () {
            let ended = await this.mowjowCrowdsale.hasEnded();
            ended.should.equal(false);
            await increaseTimeTo(this.afterEndTime);
            ended = await this.mowjowCrowdsale.hasEnded();
            ended.should.equal(true)
        });
    });
});
