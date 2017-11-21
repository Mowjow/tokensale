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


const MultiSigMowjow = artifacts.require('MultiSigMowjow')

contract('MowjowCrowdsale', function ([_, investor1, investor2, investor3, investor4, investor5, investor6, purchaser, resiver, noOvner]) {
    const cap = ether(0.1)
    const lessThanCap = ether(0.01)
    const rate = new BigNumber(20000)
    const value = ether(0.0000000000000001)

    const expectedTokenAmount = rate.mul(value)

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    })

    beforeEach(async function () {
        // this.startTime = latestTime() + duration.weeks(1);
        // this.endTime = this.startTime + duration.weeks(8);
        // this.afterEndTime = this.endTime + duration.seconds(1)

        this.multiSigMowjow = await MultiSigMowjow.deployed()
    })

    describe('payments in pre ico with 100% bonuses', function () {
        beforeEach(async function () {
            await increaseTimeTo(this.startTime)
        })

        it('should success init multisig wallet with 6 owners', async function () {
            const expectedRequired = 4;
            let multiSig = await MultiSigMowjow.new([investor1, investor2, investor3, investor4, investor5, investor6], expectedRequired)
            let owners = await multiSig.getOwners()
            let requiredConfirmations = await multiSig.required()
            let countOwners = await owners.length
            countOwners.should.be.bignumber.equal(6)
            requiredConfirmations.should.be.bignumber.equal(expectedRequired)
        })

        it('should accept payments to multisig', async function () {
            let startBalance = 0,
                expectBalance = 100,
                balance
            balance = web3.eth.getBalance(this.multiSigMowjow.address);
            balance.should.be.bignumber.equal(startBalance)
            let { logs } = await this.multiSigMowjow.send(value, { from: purchaser })
            const event = logs.find(e => e.event === 'Deposit')
            should.exist(event)
            event.args.sender.should.be.bignumber.equal(_)
            event.args.value.should.be.bignumber.equal(expectBalance)
            balance = web3.eth.getBalance(this.multiSigMowjow.address);
            balance.should.be.bignumber.equal(expectBalance)
        }) 

        it('should accept payments after start', async function () {
            let startBalance,
                expectBalance = 100,
                valueForsend = value.div(10),
                balance
            balance = web3.eth.getBalance(resiver);
            console.log("balance0", balance)
            //balance.should.be.bignumber.equal(startBalance)
            await this.multiSigMowjow.send(value, { from: purchaser })
            let { logs } = await this.multiSigMowjow.submitTransaction(resiver, 1, "payments for test ", {from: investor1})
            console.log("logs=", logs)
            // const transactionIndex = logs.find(e => e.transactionIndex === transactionIndex)
            // console.log("logs.transactionIndex", transactionIndex)
            balance = web3.eth.getBalance(resiver);
            console.log("balance1", balance)
            //confirmTransaction(logs.transactionIndex)
            // const event = logs.find(e => e.event === 'Submission')
            // should.exist(event)
            // event.args.sender.should.be.bignumber.equal(_)
            // event.args.value.should.be.bignumber.equal(expectBalance)
            // balance = web3.eth.getBalance(this.multiSigMowjow.address);
            // balance.should.be.bignumber.equal(expectBalance)
        })//

        it('should reject with no ovner address', async function () { 
            await this.multiSigMowjow.send(value, { from: purchaser })
             await this.multiSigMowjow.submitTransaction(resiver, .00000001, "0x4bb278f3", {from: noOvner}).should.be.rejectedWith(EVMThrow)  
        })


    })
})
