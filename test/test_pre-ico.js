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

contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {
    const cap = ether(0.1)
    const lessThanCap = ether(0.01)
    const rate = new BigNumber(20000)
    const value = ether(0.0000000000000001)

    const expectedTokenAmount = rate.mul(value).mul(1.5)

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

    describe('payments in pre ico for whitelist investors', function () {
        beforeEach(async function () {
            await increaseTimeTo(this.startTime - duration.days(1))
        })

        it('should add investor to whitelist successfuly and permition for invest', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor)

            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })

            const event = logs.find(e => e.event === 'PreIcoPurchase')
            should.exist(event)
        })

        it('should 50% bonus for  whitelist investor ', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor)

            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
            console.log("logs", logs)
            const event = logs.find(e => e.event === 'PreIcoPurchase')
            should.exist(event)
            event.args.beneficiary.should.be.bignumber.equal(investor)
            event.args.value.should.be.bignumber.equal(value)
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
            const balance = await this.token.balanceOf(investor)
            balance.should.be.bignumber.equal(expectedTokenAmount)
            console.log("nosold", await this.preIcoStrategy.getNotSoldTokens())
        })

        it('should reject after payment not from whitelist', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor)
            await this.mowjowCrowdsale.buyTokens(purchaser, { value, from: purchaser }).should.be.rejectedWith(EVMThrow)
        })

        it('should reject add whitelist investor after end pre ico', async function () {
            await increaseTimeTo(this.startTime)
            await this.mowjowCrowdsale.addWhitelistInvestors(investor).should.be.rejectedWith(EVMThrow)
        })
    })
})
