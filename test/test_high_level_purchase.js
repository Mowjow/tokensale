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



    describe('high-level purchase', function () {

        beforeEach(async function () {
            await increaseTimeTo(this.periodBonus0)
        })

        it('should log purchase', async function () {
            await increaseTimeTo(this.periodBonus0)
            const { logs } = await this.mowjowCrowdsale.sendTransaction({ value: value, from: investor })

            const event = logs.find(e => e.event === 'MowjowTokenPurchase')

            should.exist(event)
            event.args.purchaser.should.equal(investor)
            event.args.beneficiary.should.equal(investor)
            event.args.value.should.be.bignumber.equal(value)
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
        })

        it('should increase totalSupply', async function () {
            let initBalance = await this.token.totalSupply();
            await this.mowjowCrowdsale.send(value)
            const totalSupply = await this.token.totalSupply()
            totalSupply.should.be.bignumber.equal(initBalance.add(expectedTokenAmount))
        })

        it('should assign tokens to sender', async function () {
            await this.mowjowCrowdsale.sendTransaction({ value: value, from: investor })
            let balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(expectedTokenAmount)
        })

        it('should forward funds to wallet', async function () {
            const pre = web3.eth.getBalance(wallet)
            await this.mowjowCrowdsale.sendTransaction({ value, from: investor })
            const post = web3.eth.getBalance(wallet)
            post.minus(pre).should.be.bignumber.equal(value)
        })
    })
})
