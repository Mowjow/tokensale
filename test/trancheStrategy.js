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

        this.trancheStrategy =  await TrancheStrategy.deployed()
       
        // this.mowjowCrowdsale = await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, cap, this.trancheStrategy.address)
        // let tokenAddress = await this.mowjowCrowdsale.token();
        // this.token = MowjowToken.at(await this.mowjowCrowdsale.token())        
    })

    describe('creating a valid TrancheStrategy constructor', function () {

        it('should valid new instance', async function () {
            await TrancheStrategy.new().should.be.fulfilled;
        })


        it('should valid counting tokens', async function () {
            const { logs } =  await this.trancheStrategy.countTokens(33)  
            const event = logs.find(e => e.event === 'TokenForInvestor')
            should.exist(event)
            event.args._token.should.be.bignumber.equal(0)  
            event.args._tokenAndBonus.should.be.bignumber.equal(0)
            event.args.indexOfperiod.should.be.bignumber.equal(0)
            event.args.bonus.should.be.bignumber.equal(50)
            //event.args.currentTime.should.be.bignumber.equal(55)
        }) 

        it('should count free token', async function () {
            const { logs } =  await this.trancheStrategy.getFreeTokensInTranche(33000)  
            const event = logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event)
            event.args.freeTokens.should.be.bignumber.equal(400000000)  
            event.args.requireTokens.should.be.bignumber.equal(33000)
            event.args.hasTokensForSale.should.be.equal(false) 
        }) 
    }) 
})
