// const ether = require('./helpers/ether')
// const advanceBlock = require('./helpers/advanceToBlock')
// const increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo
// const duration = require('./helpers/increaseTime').duration
// const latestTime = require('./helpers/latestTime')
// const EVMThrow = require('./helpers/EVMThrow')

// const BigNumber = web3.BigNumber

// const should = require('chai')
//     .use(require('chai-as-promised'))
//     .use(require('chai-bignumber')(BigNumber))
//     .should()


// const MowjowCrowdsale = artifacts.require('MowjowCrowdsale')
// const MowjowToken = artifacts.require('MowjowToken')
// const EarlyContribStrategy = artifacts.require("EarlyContribStrategy");
// const PreIcoStrategy = artifacts.require("PreIcoStrategy");
// const TrancheStrategy = artifacts.require('TrancheStrategy')
// const FinalizableMowjow = artifacts.require('FinalizableMowjow') 

// contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {
//     const cap = ether(0.1)
//     const lessThanCap = ether(0.01)
//     const rate = new BigNumber(20000)
//     const value = ether(0.0000000000000001) 

//     const expectedTokenAmount = rate.mul(value).mul(2)

//     before(async function () {
//         //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
//         await advanceBlock()
//     }) 

//     beforeEach(async function () {
//         this.startTime = latestTime() + duration.weeks(1); 
//         this.endTime = this.startTime + duration.weeks(8);
//         this.afterEndTime = this.endTime + duration.seconds(1)

//         this.finalizableMowjow = await FinalizableMowjow.deployed()
//         this.earlyContribStrategy = await EarlyContribStrategy.deployed() 
//         this.preIcoStrategy = await PreIcoStrategy.deployed() 
//         this.trancheStrategy = await TrancheStrategy.deployed()
//         this.mowjowCrowdsale = await MowjowCrowdsale.new(
//             this.startTime, this.endTime, rate, wallet, cap,
//             this.earlyContribStrategy.address, this.preIcoStrategy.address,
//             this.trancheStrategy.address, this.finalizableMowjow.address)
//         let tokenAddress = await this.mowjowCrowdsale.token();
//         this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
//     })

//     describe('high-level purchase', function () {

//         beforeEach(async function () {
//             await increaseTimeTo(this.startTime)
//         })

//         it('should log purchase', async function () {
//             await increaseTimeTo(this.startTime)
//             const { logs } = await this.mowjowCrowdsale.sendTransaction({ value: value, from: investor })

//             const event = logs.find(e => e.event === 'MowjowTokenPurchase')

//             should.exist(event)
//             event.args.purchaser.should.equal(investor)
//             event.args.beneficiary.should.equal(investor)
//             event.args.value.should.be.bignumber.equal(value)
//             event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
//         })

//         it('should increase totalSupply', async function () {
//             let initBalance = await this.token.totalSupply();
//             await this.mowjowCrowdsale.send(value)
//             const totalSupply = await this.token.totalSupply()
//             totalSupply.should.be.bignumber.equal(initBalance.add(expectedTokenAmount))
//         })

//         it('should assign tokens to sender', async function () {
//             await this.mowjowCrowdsale.sendTransaction({ value: value, from: investor })
//             let balance = await this.token.balanceOf(investor);
//             balance.should.be.bignumber.equal(expectedTokenAmount)
//         })

//         it('should forward funds to wallet', async function () {
//             const pre = web3.eth.getBalance(wallet)
//             await this.mowjowCrowdsale.sendTransaction({ value, from: investor })
//             const post = web3.eth.getBalance(wallet)
//             post.minus(pre).should.be.bignumber.equal(value)
//         })
//     })
// })
