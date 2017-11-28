const ether = require('./helpers/ether');
const advanceBlock = require('./helpers/advanceToBlock');
const increaseTimeTo = require('./helpers/increaseTime').increaseTimeTo;
const duration = require('./helpers/increaseTime').duration;
const latestTime = require('./helpers/latestTime');
const EVMThrow = require('./helpers/EVMThrow');
const params = require('../migrations/config.json');
const BigNumber = web3.BigNumber;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


const MowjowCrowdsale = artifacts.require('MowjowCrowdsale');
const MowjowToken = artifacts.require('MowjowToken');
const EarlyContribStrategy = artifacts.require("EarlyContribStrategy");
const PreIcoStrategy = artifacts.require("PreIcoStrategy");
const TrancheStrategy = artifacts.require('TrancheStrategy');
const FinalizableMowjow = artifacts.require('FinalizableMowjow');
const MowjowFunds = artifacts.require('MowjowFunds');

contract('MowjowFunds', function ([_, investor, wallet, purchaser]) {
    const cap = ether(0.1);
    const lessThanCap = ether(0.01);
    const rate = new BigNumber(20000);
    const value = ether(0.00000000000000011);

    const expectedTokenAmount = rate.mul(value).mul(1.5);

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    });


    let tokenParams = params.mowjow_token;

    beforeEach(async function () {
        this.startTime = latestTime() + duration.weeks(1);
        this.endTime = this.startTime + duration.weeks(8);
        this.afterEndTime = this.endTime + duration.seconds(1);
        this.finalizableMowjow = await FinalizableMowjow.deployed();
        this.earlyContribStrategy = await EarlyContribStrategy.deployed();
        this.preIcoStrategy = await PreIcoStrategy.deployed();
        this.trancheStrategy = await TrancheStrategy.deployed();
        this.mowjowFunds = await MowjowFunds.deployed();
        this.mowjowCrowdsale = await MowjowCrowdsale.new(
            this.startTime, this.endTime, rate, wallet, cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, this.finalizableMowjow.address);

        this.token = await MowjowToken.new(tokenParams.name, tokenParams.symbol,
            tokenParams.decimals, tokenParams.initial_supply);
    });

    describe('payments in mowjow Funds', function () {

        it('should add amount to fund', async function () {
            const {logs} = await this.mowjowFunds.fund(0, 100);
            const event = logs.find(e => e.event === 'AddedBalanceToFund');
            should.exist(event);
            event.args.numberFund.should.be.bignumber.equal(0);
            event.args.addedTokens.should.be.bignumber.equal(100);
            event.args.sumTokensFund.should.be.bignumber.equal(100)
        });

        it('should send amount from fund to address', async function() {
            await this.token.mint(_, 1000, {from: _});
            const {logs} = await this.mowjowFunds.fund(0, 100);
            await this.token.changeStatusFinalized({from: _});
            // const instance = await this.mowjowFunds.transferToFund(investor, 0, 50, this.token.address, {from: _});
            // let balance = await this.token.balanceOf(_);
            // const newEvent = instance.logs.find(e => e.event === 'SentFromFund');
            // should.exist(newEvent);
            // newEvent.args.numberFund.should.be.bignumber.equal(0);
            // newEvent.args.destination.should.be.bignumber.equal(investor);
            // newEvent.args.sentTokens.should.be.bignumber.equal(50)
        })
    })
});
