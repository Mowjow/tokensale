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


// const MultiSigMowjow = artifacts.require('MultiSigMowjow')

// contract('MowjowCrowdsale', function ([_, investor1, investor2, investor3, investor4, investor5, investor6, purchaser, resiver, noOvner]) {
//     const cap = ether(0.1)
//     const lessThanCap = ether(0.01)
//     const rate = new BigNumber(20000)
//     const value = ether(0.0000000000000001)

//     const valueForSend = ether(0.055);
//     const expectedTokenAmount = rate.mul(value)

//     before(async function () {
//         //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
//         await advanceBlock()
//     })

//     beforeEach(async function () { 
//         this.multiSigMowjow = await MultiSigMowjow.deployed()
//     })

//     describe('payments in pre ico with 100% bonuses', function () {
//         beforeEach(async function () {
//             await increaseTimeTo(this.startTime)
//         })

//         it('should success init multisig wallet with 6 owners', async function () {
//             const expectedRequired = 4;
//             let multiSig = await MultiSigMowjow.new([investor1, investor2, investor3, investor4, investor5, investor6], expectedRequired)
//             let owners = await multiSig.getOwners()
//             let requiredConfirmations = await multiSig.required()
//             let countOwners = await owners.length
//             countOwners.should.be.bignumber.equal(6)
//             requiredConfirmations.should.be.bignumber.equal(expectedRequired)
//         })

//         it('should accept payments to multisig', async function () {
//             let startBalance = 0,
//                 expectBalance = 100,
//                 balance
//             balance = web3.eth.getBalance(this.multiSigMowjow.address);
//             balance.should.be.bignumber.equal(startBalance)
//             let { logs } = await this.multiSigMowjow.send(value, { from: purchaser })
//             const event = logs.find(e => e.event === 'Deposit')
//             should.exist(event)
//             event.args.sender.should.be.bignumber.equal(_)
//             event.args.value.should.be.bignumber.equal(expectBalance)
//             balance = web3.eth.getBalance(this.multiSigMowjow.address);
//             balance.should.be.bignumber.equal(expectBalance)
//         }) 

//         it('should payment from multisig', async function () {
//             let startBalance, 
//                 valueForsend = value.div(50),
//                 balance,
//                 hasConfirmed = false
//                 expectBalance = web3.eth.getBalance(resiver).add(valueForsend) 

//             await this.multiSigMowjow.send(value, { from: purchaser }) 
//             const {logs} = await this.multiSigMowjow.submitTransaction(resiver, valueForsend, "payments for test ", {from: investor1})
//             let ind = logs.find(t =>"transactionIndex") 
//             await this.multiSigMowjow.confirmTransaction(ind.transactionIndex, {from: investor2})
//             hasConfirmed = await this.multiSigMowjow.isConfirmed(ind.transactionIndex)
//             hasConfirmed.should.be.equal(false)
//             await this.multiSigMowjow.confirmTransaction(ind.transactionIndex, {from: investor3})
//             hasConfirmed = await this.multiSigMowjow.isConfirmed(ind.transactionIndex)
//             hasConfirmed.should.be.equal(false) 
//             await this.multiSigMowjow.confirmTransaction(ind.transactionIndex, {from: investor4})
//             hasConfirmed = await this.multiSigMowjow.isConfirmed(ind.transactionIndex)
//             hasConfirmed.should.be.equal(true)  
//             balance = web3.eth.getBalance(resiver); 
//             balance.should.be.bignumber.equal(expectBalance)
            
//         })

//         it('should reject with no ovner address', async function () { 
//             await this.multiSigMowjow.send(value, { from: purchaser })
//             await this.multiSigMowjow.submitTransaction(resiver, .00000001, "0x4bb278f3", {from: noOvner}).should.be.rejectedWith(EVMThrow)  
//         })


//     })
// })
