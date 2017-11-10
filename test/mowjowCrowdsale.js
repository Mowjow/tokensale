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

    this.mowjowCrowdsale = await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, cap) 
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

  describe('accepting payments in different time of the crowdsale', function () {

    it('should reject payments before start', async function () {
      await this.mowjowCrowdsale.send(value).should.be.rejectedWith(EVMThrow)
      await this.mowjowCrowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMThrow)
    })

    it('should accept payments after start', async function () {
      await increaseTimeTo(this.startTime)
      await this.mowjowCrowdsale.send(value).should.be.fulfilled
      await this.mowjowCrowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled
    })
  })

  describe('high-level purchase', function () {

    beforeEach(async function () {
      await increaseTimeTo(this.periodBonus0)
    })

    it('should log purchase', async function () {
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

  describe('low-level purchase', function () {

    beforeEach(async function () {
      await increaseTimeTo(this.periodBonus0)
    })

    it('should log purchase', async function () {
      const { logs } = await this.mowjowCrowdsale.buyTokens(investor, { value: value, from: purchaser })

      const event = logs.find(e => e.event === 'MowjowTokenPurchase')

      should.exist(event)
      event.args.purchaser.should.equal(purchaser)
      event.args.beneficiary.should.equal(investor)
      event.args.value.should.be.bignumber.equal(value)
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should increase totalSupply', async function () {
      let initBalance = await this.token.totalSupply();
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const totalSupply = await this.token.totalSupply()
      totalSupply.should.be.bignumber.equal(initBalance.add(expectedTokenAmount))
    })

    it('should assign tokens to beneficiary', async function () {
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet)
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const post = web3.eth.getBalance(wallet)
      post.minus(pre).should.be.bignumber.equal(value)
    })

  })

  describe('payments in different transhes', function () {
    it('should assign tokens and 50% bonus', async function () {
      await increaseTimeTo(this.startTime)
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount * 1.5)
    })

    it('should assign tokens and 35% bonus', async function () {
      await increaseTimeTo(this.periodBonus35)
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount * 1.35)
    })

    it('should assign tokens and 20% bonus', async function () {
      await increaseTimeTo(this.periodBonus20)
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount * 1.2)
    })

    it('should assign tokens and 5% bonus', async function () {
      await increaseTimeTo(this.periodBonus5)
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount * 1.05)
    })

    it('should assign tokens and 0% bonus', async function () {
      await increaseTimeTo(this.periodBonus0)
      await this.mowjowCrowdsale.buyTokens(investor, { value, from: purchaser })
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount)
    })
  }) 

})
