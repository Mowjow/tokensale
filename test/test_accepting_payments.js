const ether = require('./helpers/ether')
const advanceBlock = require('./helpers/advanceToBlock')
const increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo
const duration = require('./helpers/increaseTime').duration
const latestTime = require('./helpers/latestTime')
const EVMThrow = require('./helpers/EVMThrow')

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

const MowjowCrowdsale = artifacts.require('MowjowCrowdsale')
const MowjowToken = artifacts.require('MowjowToken')
const TrancheStrategy = artifacts.require('TrancheStrategy')

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {
    const cap = ether(5)
    const lessThanCap = ether(1)
    const rate = new BigNumber(20000)
    const value = ether(0.000001)

    const expectedTokenAmount = rate.mul(value)

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    })

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1);
        this.periodBonus35 = this.startTime + duration.days(15);
        this.periodBonus20 = this.startTime + duration.days(30);
        this.periodBonus5 = this.startTime + duration.days(40);
        this.periodBonus0 = this.startTime + duration.days(50);
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.seconds(1)

        this.trancheStrategy = await TrancheStrategy.deployed()
        this.mowjowCrowdsale = await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, cap, this.trancheStrategy.address)
        let tokenAddress = await this.mowjowCrowdsale.token();
        this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
    })

    describe('creating a valid crowdsale', function () {

        it('should fail with zero cap', async function () {
            await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, 0).should.be.rejectedWith(EVMThrow);
        })

    });

    describe('accepting payments', function () {

        beforeEach(async function () {
            await increaseTimeTo(this.startTime)
        })

        it('should be token owner', async function () {
            const owner = await this.token.owner()
            owner.should.equal(this.mowjowCrowdsale.address)
        })

        it('should reject payments when amount of investor is zero', async function () {
            await this.mowjowCrowdsale.buyTokens(investor, { value: 0, from: purchaser }).should.be.rejectedWith(EVMThrow)
        })

        it('should be ended only after end', async function () {
            let ended = await this.mowjowCrowdsale.hasEnded()
            ended.should.equal(false)
            await increaseTimeTo(this.afterEndTime)
            ended = await this.mowjowCrowdsale.hasEnded()
            ended.should.equal(true)
        })

        it('should accept payments within cap', async function () {
            await this.mowjowCrowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled
            await this.mowjowCrowdsale.send(lessThanCap).should.be.fulfilled
        })

        it('should reject payments outside cap', async function () {
            await this.mowjowCrowdsale.send(cap)
            await this.mowjowCrowdsale.send(2).should.be.rejectedWith(EVMThrow)
        })

        it('should reject payments that exceed cap', async function () {
            await this.mowjowCrowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMThrow)
        })

    })

    describe('accepting payments in different time of the crowdsale', function () {

        it('should reject payments before start', async function () {
            await increaseTimeTo(this.startTime - duration.days(1))
            await this.mowjowCrowdsale.send(value).should.be.rejectedWith(EVMThrow)
            await this.mowjowCrowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMThrow)
        })

        it('should accept payments after start', async function () {
            await increaseTimeTo(this.startTime)
            await this.mowjowCrowdsale.send(value).should.be.fulfilled
            //await this.mowjowCrowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled
        })
    })
})
