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

        this.trancheStrategy = await TrancheStrategy.new(this.startTime)
        this.mowjowCrowdsale = await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, cap, this.trancheStrategy.address)
        let tokenAddress = await this.mowjowCrowdsale.token();
        this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
    })

    describe('creating a valid TrancheStrategy constructor', function () {

        it('should valid new instance', async function () {
            await TrancheStrategy.new().should.be.fulfilled;
        })

        it('should valid new instance', async function () {
            let tokens = await this.trancheStrategy.maxCountTokensForSaleInPeriod()
            tokens.should.be.bignumber.equal(4e8);
        })
    });

    describe('accepting payments', function () {

        beforeEach(async function () {
            await increaseTimeTo(this.startTime)
        })

        it('should set valid parameters', async function () {
            let expectedDays = 33,
                days,
                expectedBonus = 66,
                bonus,
                expextedTokensForTranchePeriod = 123456,
                tokensForTranchePeriod

            const { logs } = await this.trancheStrategy.setTranche(expectedDays, expextedTokensForTranchePeriod, expectedBonus)
            const event = logs.find(e => e.event === 'trancheSet')
            should.exist(event)
            event.args._daysOfTranche.should.be.bignumber.equal(expectedDays)
            event.args._tokenForTranchePeriod.should.be.bignumber.equal(expextedTokensForTranchePeriod)
            event.args._bonusForTranchePeriod.should.be.bignumber.equal(expectedBonus)

        })

        it('should assign tokens and 50% bonus', async function () {
            const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
            const balance = await this.token.balanceOf(investor)
            balance.should.be.bignumber.equal(expectedTokenAmount * 1.5)
            console.log("balance", balance)
            console.log("logs", logs)
            let tokens = await this.trancheStrategy.isNoOverSoldInCurrentTranche(value)

            const event = logs.find(e => e.event === 'tokensSoldInTranche')
            should.exist(event)
            console.log("event.args", event.args)
            event.args._tokenForTranchePeriod.should.be.bignumber.equal(balance)

        })
    })
})
