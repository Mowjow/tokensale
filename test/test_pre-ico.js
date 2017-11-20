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
        this.trancheStrategy = await TrancheStrategy.deployed()
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.trancheStrategy.address, this.finalizableMowjow.address)
        // let tokenAddress = await this.mowjowCrowdsale.token();
        // this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
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
        this.mowjowCrowdsale = await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, cap, this.trancheStrategy.address, this.finalizableMowjow.address)
        let tokenAddress = await this.mowjowCrowdsale.token();
        this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
    })

    describe('payments in pre ico with 100% bonuses', function () {
        beforeEach(async function () {
            await increaseTimeTo(this.startTime - duration.days(25))
        })
        it('should payments from whitelist', async function () {
            await this.mowjowCrowdsale.startPreIco()
            const addrPreIcoMowjow = await this.mowjowCrowdsale.preIcoMowjow()
            const preIcoMowjow = PreIcoMowjow.at(addrPreIcoMowjow)
            let preIcoInvestor = await preIcoMowjow.whitelistInvestors(0) 
            const { logs } = await this.mowjowCrowdsale.buyTokens(preIcoInvestor, { value, from: purchaser })

            const event = logs.find(e => e.event === 'MowjowTokenPurchase')
            should.exist(event) 
            event.args.beneficiary.should.be.bignumber.equal(preIcoInvestor)
            event.args.value.should.be.bignumber.equal(value)
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
            const balance = await this.token.balanceOf(preIcoInvestor)
            balance.should.be.bignumber.equal(expectedTokenAmount)
        })

        it('should reject after payment not from whitelist', async function () {
            await this.mowjowCrowdsale.startPreIco() 
            await this.mowjowCrowdsale.buyTokens(purchaser, { value, from: purchaser }).should.be.rejectedWith(EVMThrow) 
        })

        it('should reject after payment in end time pre ico', async function () {
            await this.mowjowCrowdsale.startPreIco() 
            await this.mowjowCrowdsale.buyTokens(purchaser, { value, from: purchaser }).should.be.rejectedWith(EVMThrow) 
        })
    })
})
