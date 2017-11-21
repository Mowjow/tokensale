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
const EarlyContribStrategy = artifacts.require("EarlyContribStrategy");
const PreIcoStrategy = artifacts.require("PreIcoStrategy");
const TrancheStrategy = artifacts.require('TrancheStrategy')
const FinalizableMowjow = artifacts.require('FinalizableMowjow')
const PreIcoMowjow = artifacts.require('PreIcoMowjow')

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {
    const cap = ether(0.1)
    const lessThanCap = ether(0.01)
    const rate = new BigNumber(20000)
    const value = ether(0.0000000000000001) 

    const expectedTokenAmount = rate.mul(value).mul(2)

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    }) 

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1); 
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.seconds(1)

        this.finalizableMowjow = await FinalizableMowjow.deployed()
        this.earlyContribStrategy = await EarlyContribStrategy.deployed() 
        this.preIcoStrategy = await PreIcoStrategy.deployed() 
        this.trancheStrategy = await TrancheStrategy.deployed()
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address)
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
