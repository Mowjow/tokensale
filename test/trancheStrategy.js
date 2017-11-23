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

contract('TrancheStrategy', function ([_, investor, wallet, purchaser]) {
    const cap = ether(5)
    const lessThanCap = ether(1)
    const rate = new BigNumber(20000)
    const value = ether(0.000001)
    const maxRequireTokens = 6e8;
    const expectedTokenAmount = rate.mul(value)

    before(async function () {

        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc 
        await advanceBlock()
    })

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1);    
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.seconds(1)

        this.trancheStrategy = await TrancheStrategy.deployed()

        // this.mowjowCrowdsale = await MowjowCrowdsale.new(this.startTime, this.endTime, rate, wallet, cap, this.trancheStrategy.address)
        // let tokenAddress = await this.mowjowCrowdsale.token();
        // this.token = MowjowToken.at(await this.mowjowCrowdsale.token())        
    })

    describe('creating a valid TrancheStrategy constructor', function () {
        // beforeEach(async function () {
        //     this.trancheStrategy =  await TrancheStrategy.deployed()

        // })  

        it('should valid new instance', async function () {
            await TrancheStrategy.new().should.be.fulfilled;
        })


        it('should valid counting tokens', async function () {
            await this.trancheStrategy.setRate(100);
            const { logs } = await this.trancheStrategy.countTokens(100)
            const event = logs.find(e => e.event === 'TokenForInvestor')
            should.exist(event)
            event.args._token.should.be.bignumber.equal(10000)
            event.args._tokenAndBonus.should.be.bignumber.equal(13500)
            event.args.indexOfperiod.should.be.bignumber.equal(0)
            event.args.bonus.should.be.bignumber.equal(35)
        })

        it('should count free token', async function () {
            const { logs } = await this.trancheStrategy.getFreeTokensInTranche(33000)
            const event = logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event)
            event.args.freeTokens.should.be.bignumber.equal(maxRequireTokens)
            event.args.requireTokens.should.be.bignumber.equal(33000)
            event.args.hasTokensForSale.should.be.equal(true)
        })

        it('should count free tokens', async function () {
            const { logs } = await this.trancheStrategy.getFreeTokensInTranche(maxRequireTokens)
            const event = logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event)
            event.args.freeTokens.should.be.bignumber.equal(400000000)
            event.args.requireTokens.should.be.bignumber.equal(maxRequireTokens)
            event.args.hasTokensForSale.should.be.equal(false)
        })

        it('should count free tokens after sale', async function () {
            await this.trancheStrategy.soldInTranche(100000000)
            const { logs } = await this.trancheStrategy.getFreeTokensInTranche(200000000)
            const event = logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event)
            event.args.freeTokens.should.be.bignumber.equal(300000000)
            event.args.requireTokens.should.be.bignumber.equal(200000000)
            event.args.hasTokensForSale.should.be.equal(true)
        })

        it('should count free tokens after saled of one of tranches', async function () {
            //await this.trancheStrategy.soldInTranche(300000000)
            const { logs } = await this.trancheStrategy.getFreeTokensInTranche(1)
            const event = logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event)
            event.args.freeTokens.should.be.bignumber.equal(300000000)
            event.args.requireTokens.should.be.bignumber.equal(1)
            event.args.hasTokensForSale.should.be.equal(true)
        })
    })

    describe('TrancheStrategy between tranches', function () {

        it('should sold all the tranche ', async function () {
            const _bonuses = [50, 35, 20, 5, 0];   //rate of bonus for the current tranche
            const _valueForTranches = [4e8, 4e8, 4e8, 4e8, 4e8];
            let trancheStrategy = await TrancheStrategy.new(_bonuses, _valueForTranches)
            await trancheStrategy.soldInTranche(400000000)
            const { logs } = await trancheStrategy.getFreeTokensInTranche(200000000)
            const event = logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event)
            event.args.freeTokens.should.be.bignumber.equal(400000000)
            event.args.requireTokens.should.be.bignumber.equal(200000000)
            event.args.hasTokensForSale.should.be.equal(true)
            await trancheStrategy.soldInTranche(100000000)
            const log1 = await trancheStrategy.getFreeTokensInTranche(100000000)
            const event1 = log1.logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event1)
            event1.args.freeTokens.should.be.bignumber.equal(300000000)
            event1.args.requireTokens.should.be.bignumber.equal(100000000)
            event1.args.hasTokensForSale.should.be.equal(true)
        })

        it('should sold all the tranches ', async function () {
            const _bonuses = [35, 20, 5, 0],   //rate of bonus for the current tranche
                _valueForTranches = [6e8, 6e8, 6e8, 6e8];
            let trancheStrategy,
                expectedTotalSaleTokens = 2000000000,
                expectedFreeTokens = 0,
                requireTokens = 1,
                hasTokensForAllSale = false

            trancheStrategy = await TrancheStrategy.new(_bonuses, _valueForTranches)
            for (let i = 0; i < _valueForTranches.length; i++) {
                await trancheStrategy.soldInTranche(_valueForTranches[i]);
            }

            let totalSoldTokens = await trancheStrategy.totalSoldTokens()
            totalSoldTokens.should.be.bignumber.equal(expectedTotalSaleTokens)
            const log1 = await trancheStrategy.getFreeTokensInTranche(requireTokens)
            const event1 = log1.logs.find(e => e.event === 'AvalibleTokens')
            should.exist(event1)
            event1.args.freeTokens.should.be.bignumber.equal(expectedFreeTokens)
            event1.args.requireTokens.should.be.bignumber.equal(requireTokens)
            event1.args.hasTokensForSale.should.be.equal(hasTokensForAllSale)
        })

        it('should reject after sold of  all the tranches ', async function () {
            const _bonuses = [35, 20, 5, 0],   //rate of bonus for the current tranche
                _valueForTranches = [6e8, 6e8, 6e8, 6e8];
            let trancheStrategy,
                expectedTotalSaleTokens = 2000000000, 
                testOverSaleToken = 1;

            trancheStrategy = await TrancheStrategy.new(_bonuses, _valueForTranches)
            for (let i = 0; i < _valueForTranches.length; i++) {
                await trancheStrategy.soldInTranche(_valueForTranches[i]);
            }

            let totalSoldTokens = await trancheStrategy.totalSoldTokens()
            totalSoldTokens.should.be.bignumber.equal(expectedTotalSaleTokens)
            await trancheStrategy.soldInTranche(testOverSaleToken).should.be.rejectedWith(EVMThrow)
            
        })
    })
})
