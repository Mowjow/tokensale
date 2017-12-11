const helper = require('./helper');
const { ADDED_BALANCE_EVENT, SENT_FROM_FUND_EVENT, tokenParams } = require('./helpers/config.json');
const MowjowToken = artifacts.require('./MowjowToken.sol');
const MowjowFunds = artifacts.require('./MowjowFunds.sol');
const should = helper.should;

contract('MowjowFunds', function ([_, investor]) {

    beforeEach(async function () {
        await helper.advanceBlock();
        this.token = await MowjowToken.new(tokenParams.name, tokenParams.symbol,
            tokenParams.decimals, tokenParams.initial_supply);
        this.mowjowFunds = await MowjowFunds.deployed();
    });

    describe('payments in mowjow Funds', function () {

        it('should add amount to fund', async function () {
            const {logs} = await this.mowjowFunds.fund(0, 100, {from: _});
            const event = logs.find(e => e.event === ADDED_BALANCE_EVENT);
            should.exist(event);
            event.args.numberFund.should.be.bignumber.equal(0);
            event.args.addedTokens.should.be.bignumber.equal(100);
            event.args.sumTokensFund.should.be.bignumber.equal(100);
        });

        it('should send amount from fund to address', async function() {
            await this.token.mint(this.mowjowFunds.address, 10000000, {from: _});
            await this.token.changeStatusFinalized({from: _});
            const instance = await this.mowjowFunds.transferToFund(investor, 0, 50, this.token.address, {from: _});
            const newEvent = instance.logs.find(e => e.event === SENT_FROM_FUND_EVENT);
            should.exist(newEvent);
            newEvent.args.numberFund.should.be.bignumber.equal(0);
            newEvent.args.destination.should.be.bignumber.equal(investor);
            newEvent.args.sentTokens.should.be.bignumber.equal(50);
        })
    })
});
