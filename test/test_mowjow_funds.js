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
// const MowjowFunds = artifacts.require('MowjowFunds')

// contract('MowjowCrowdsale', function ([_, investor, wallet, purchaser]) {
//     const cap = ether(0.1)
//     const lessThanCap = ether(0.01)
//     const rate = new BigNumber(20000)
//     const value = ether(0.00000000000000011)

//     const expectedTokenAmount = rate.mul(value).mul(1.5)

//     before(async function () {
//         //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
//         await advanceBlock()
//     })

//     beforeEach(async function () {
//         this.startTime = latestTime() + duration.weeks(1);
//         this.endTime = this.startTime + duration.weeks(8);
//         this.afterEndTime = this.endTime + duration.seconds(1) 
        
//         this.mowjowFunds = await MowjowFunds.deployed()
//         // this.finalizableMowjow = await FinalizableMowjow.deployed()
//         // this.earlyContribStrategy = await EarlyContribStrategy.deployed()
//         // this.preIcoStrategy = await PreIcoStrategy.deployed()
//         // this.trancheStrategy = await TrancheStrategy.deployed()
//         // this.mowjowCrowdsale = await MowjowCrowdsale.new(
//         //     this.startTime, this.endTime, rate, wallet, cap,
//         //     this.earlyContribStrategy.address, this.preIcoStrategy.address,
//         //     this.trancheStrategy.address, this.finalizableMowjow.address)
//         // this.tokenAddress = await this.mowjowCrowdsale.token();
//         // this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
//         this.token = await MowjowToken.new();
//     })

//     describe('payments in mowjow Funds', function () {
//         beforeEach(async function () { 
//         })

//         it('should add amount to fund', async function () { 
//             const {logs} = await this.mowjowFunds.fund(0, 100) 
//             const event = logs.find(e => e.event === 'AddedBalanceToFund')
//             should.exist(event)
//             event.args.numberFund.should.be.bignumber.equal(0) 
//             event.args.addedTokens.should.be.bignumber.equal(100)
//             event.args.sumTokensFund.should.be.bignumber.equal(100)  
//         })

//         it('should sent amount from fund to address', async function () { 
//             const tokenMow = await MowjowToken.new(); 
//             const {logs} = await this.mowjowFunds.fund(0, 100) 
//             const instance = await this.mowjowFunds.transferToFund(investor, 0, 50, tokenMow.address)
//             const newEvent = instance.logs.find(e => e.event === 'SentFromFund')
//             should.exist(newEvent)
//             newEvent.args.numberFund.should.be.bignumber.equal(0) 
//             newEvent.args.destination.should.be.bignumber.equal(investor)
//             newEvent.args.sentTokens.should.be.bignumber.equal(50) 
//             //newEvent.args.sumTokensFund.should.be.bignumber.equal(50)

//         })
//     })
// })
