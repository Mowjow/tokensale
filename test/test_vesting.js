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
// const TrancheStrategy = artifacts.require('TrancheStrategy')
// const FinalizableMowjow = artifacts.require('FinalizableMowjow')

// contract('FinalizableMowjow', function ([_, investor, wallet, purchaser]) {
//     const cap = ether(0.1)
//     const lessThanCap = ether(0.01)
//     const rate = new BigNumber(20000)
//     const value = ether(0.0000001)

//     const expectedTokenAmount = rate.mul(value)

//     before(async function () {
//         //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
//         await advanceBlock()
//     })

//     beforeEach(async function () {
//         this.startTime = latestTime() + duration.weeks(1);
//         this.periodBonus35 = this.startTime + duration.days(15);
//         this.periodBonus20 = this.startTime + duration.days(30);
//         this.periodBonus5 = this.startTime + duration.days(40);
//         this.periodBonus0 = this.startTime + duration.days(50);
//         this.cliffTime = this.startTime + duration.days(60);
//         this.vestingTime = this.startTime + duration.days(90);
//         this.endTime = this.startTime + duration.weeks(8);
//         this.afterEndTime = this.endTime + duration.seconds(1);

//         this.finalizableMowjow = await FinalizableMowjow.deployed()
//         this.trancheStrategy = await TrancheStrategy.deployed()
//         this.mowjowCrowdsale = await MowjowCrowdsale.new(
//             this.startTime, this.endTime, rate, wallet, cap,
//             this.trancheStrategy.address, this.finalizableMowjow.address)
//         let tokenAddress = await this.mowjowCrowdsale.token();
//         this.token = MowjowToken.at(await this.mowjowCrowdsale.token())
//     })

//     describe('finalize not start', function () {
//         beforeEach(async function () {
//             await increaseTimeTo(this.startTime)
//         })
//         it('should falthy after start', async function () {
//             let isFinalize = await this.mowjowCrowdsale.isFinalized()
//             isFinalize.should.be.equal(false)
//             let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale()
//             isFinishedCrowdsale.should.be.equal(false)
//         })

//         it('should not be ended if under cap', async function () {
//             let hasEnded = await this.mowjowCrowdsale.hasEnded()
//             hasEnded.should.equal(false)
//             await this.mowjowCrowdsale.send(lessThanCap)
//             hasEnded = await this.mowjowCrowdsale.hasEnded()
//             hasEnded.should.equal(false)
//             let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale()
//             isFinishedCrowdsale.should.be.equal(false)
//         })

//         it('should not be ended if just under cap', async function () {
//             await this.mowjowCrowdsale.send(cap.minus(1))
//             let hasEnded = await this.mowjowCrowdsale.hasEnded()
//             hasEnded.should.equal(false)
//             let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale()
//             isFinishedCrowdsale.should.be.equal(false)
//         })

//         it('should be ended if cap reached', async function () {
//             await this.mowjowCrowdsale.send(cap)
//             let hasEnded = await this.mowjowCrowdsale.hasEnded()
//             hasEnded.should.equal(true)
//         })

//         it('should be finalized', async function () {
//             await this.mowjowCrowdsale.send(cap)
//             let hasEnded = await this.mowjowCrowdsale.hasEnded()
//             hasEnded.should.equal(true)
//             let isFinalize = await this.mowjowCrowdsale.isFinalized()
//             isFinalize.should.be.equal(false)
//             const { logs } = await this.mowjowCrowdsale.finalize()
//             const event = logs.find(e => e.event === 'Finalized')
//             should.exist(event)
//             isFinalize = await this.mowjowCrowdsale.isFinalized()
//             isFinalize.should.be.equal(true)
//             let isFinishedCrowdsale = await this.finalizableMowjow.isFinishedCrowdsale()
//             isFinishedCrowdsale.should.be.equal(true)

//         })
//     })

//     describe('finalize started', function () {
//         beforeEach(async function () {
//             await increaseTimeTo(this.startTime)
//             await this.mowjowCrowdsale.send(cap)
//             await this.mowjowCrowdsale.finalize()

//         })        

//         it('should set amount team', async function () {
//             let expectLengthOfArrayTokenGrant = 1
//             let addressWalletTeam = await this.mowjowCrowdsale.walletTeam()
//             const balanceWalletTeam = web3.eth.getBalance(addressWalletTeam)
//             let amountTeam = await this.token.tokenGrantsCount(addressWalletTeam)
//             amountTeam.should.be.bignumber.equal(expectLengthOfArrayTokenGrant)
//         })

//         it('should before cliff date tokens are not accessibly', async function () {             
//             let currentTime  = this.startTime + duration.days(50),
//             expectAvalableTokens = 0
//             let avalableTokens = await this.token.calculateVestedTokens(100, currentTime, this.startTime, this.cliffTime, this.vestingTime)
//             avalableTokens.should.be.bignumber.equal(expectAvalableTokens)
//         })

//         it('should after vesting date partly tokens are accessibly', async function () {             
//             let currentTime  = this.startTime + duration.days(61),
//             expectAvalableTokens = Math.floor((100 * (currentTime - this.startTime)) / (this.vestingTime - this.startTime))

//             let avalableTokens = await this.token.calculateVestedTokens(100, currentTime, this.startTime, this.cliffTime, this.vestingTime)
//             avalableTokens.should.be.bignumber.equal(expectAvalableTokens)
//         })

//         it('should after vesting date all tokens are accessibly', async function () {             
//             let currentTime  = this.startTime + duration.days(90),
//             expectAvalableTokens = Math.floor((100 * (currentTime - this.startTime)) / (this.vestingTime - this.startTime))

//             let avalableTokens = await this.token.calculateVestedTokens(100, currentTime, this.startTime, this.cliffTime, this.vestingTime)

//             avalableTokens.should.be.bignumber.equal(expectAvalableTokens)
//         })

//         it('should calculate the date before vesting when the holder can transfer all its tokens', async function () {             
//             let currentTime  = this.vestingTime - duration.days(1),
//             expectDays = this.vestingTime

//             let avalableTokens = await this.token.calculateVestedTokens(100, currentTime, this.startTime, this.cliffTime, this.vestingTime)
//             let addressWalletTeam = await this.mowjowCrowdsale.walletTeam()
//             let daysBeforeVesting = await this.token.lastTokenIsTransferableDate(addressWalletTeam)

//             daysBeforeVesting.should.be.bignumber.equal(expectDays)
//         })

//         it('should calculate the date after vesting when the holder can transfer all its tokens', async function () {             
//             let currentTime  = this.vestingTime + duration.days(1),
//             expectDays = this.vestingTime

//             let avalableTokens = await this.token.calculateVestedTokens(100, currentTime, this.startTime, this.cliffTime, this.vestingTime)
//             let addressWalletTeam = await this.mowjowCrowdsale.walletTeam()
//             let daysBeforeVesting = await this.token.lastTokenIsTransferableDate(addressWalletTeam)

//             daysBeforeVesting.should.be.bignumber.above(expectDays)
//         })

//         it('should calculate the total amount of transferable tokens before cliff date of a holder at a given time', async function () {             
//             let currentTime  = this.cliffTime - duration.days(1),
//             expectFreeTokens = 0

//             let avalableTokens = await this.token.calculateVestedTokens(2000000000, currentTime, this.startTime, this.cliffTime, this.vestingTime)
//             let addressWalletTeam = await this.mowjowCrowdsale.walletTeam()
//             let freeTokens = await this.token.transferableTokens(addressWalletTeam, currentTime)

//             freeTokens.should.be.bignumber.equal(expectFreeTokens)
//         })

//         it('should calculate the total amount of transferable tokens after cliff date of a holder at a given time', async function () { 
//             let totalTokens = await this.token.calculateVestedTokens(2000000000, this.vestingTime, this.startTime, this.cliffTime, this.vestingTime)            
//             let currentTime  = this.cliffTime + duration.days(1),
//             expectAvalableTokens = Math.floor((totalTokens * (currentTime - this.startTime)) / (this.vestingTime - this.startTime)) 
           
//             let addressWalletTeam = await this.mowjowCrowdsale.walletTeam() 
//             let freeTokens = await this.token.transferableTokens(addressWalletTeam, currentTime)

//             freeTokens.should.be.bignumber.equal(expectAvalableTokens)
//         })

//         it('should calculate the total amount of transferable tokens after vesting date of a holder at a given time', async function () { 
//             let totalTokens = await this.token.calculateVestedTokens(2000000000, this.vestingTime, this.startTime, this.cliffTime, this.vestingTime)            
//             let currentTime  = this.vestingTime,
//             expectAvalableTokens = Math.floor((totalTokens * (currentTime - this.startTime)) / (this.vestingTime - this.startTime)) 
           
//             let addressWalletTeam = await this.mowjowCrowdsale.walletTeam() 
//             let freeTokens = await this.token.transferableTokens(addressWalletTeam, currentTime)

//             freeTokens.should.be.bignumber.equal(expectAvalableTokens)
//         })

       
//     })
// })
