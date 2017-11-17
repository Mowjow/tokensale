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
const FinalizableMowjow = artifacts.require('FinalizableMowjow')

contract('FinalizableMowjow', function ([_, investor, wallet, purchaser]) {
    const cap = ether(0.1)
    const lessThanCap = ether(0.01)
    const rate = new BigNumber(20000)
    const value = ether(0.0000001)

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

        this.finalizableMowjow = await FinalizableMowjow.deployed()
        this.trancheStrategy = await TrancheStrategy.deployed()
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.trancheStrategy.address, this.finalizableMowjow.address)
        let tokenAddress = await this.mowjowCrowdsale.token();
        this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
    })

    describe('ending', function () {

        beforeEach(async function () {
            await increaseTimeTo(this.startTime)
        })

        it('should not be ended if under cap', async function () {
            let hasEnded = await this.mowjowCrowdsale.hasEnded()
            hasEnded.should.equal(false)
            await this.mowjowCrowdsale.send(lessThanCap)
            hasEnded = await this.mowjowCrowdsale.hasEnded()
            hasEnded.should.equal(false)
        })

        it('should not be ended if just under cap', async function () {
            await this.mowjowCrowdsale.send(cap.minus(1))
            let hasEnded = await this.mowjowCrowdsale.hasEnded()
            hasEnded.should.equal(false)
        })

        it('should be ended if cap reached', async function () {
            await this.mowjowCrowdsale.send(cap)
            let hasEnded = await this.mowjowCrowdsale.hasEnded()
            hasEnded.should.equal(true)
        })
    })
})
