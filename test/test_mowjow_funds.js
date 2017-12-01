const params = require('../migrations/config.json');
const t = require('./helper');
const should = t.should;

contract('MowjowFunds', function ([_, investor]) {
    let tokenParams = params.mowjow_token;

    beforeEach(async function () {
        this.token = await t.MowjowToken.new(tokenParams.name, tokenParams.symbol,
            tokenParams.decimals, tokenParams.initial_supply);
        this.mowjowFunds = await t.MowjowFunds.deployed();
    });

    describe('payments in mowjow Funds', function () {

        it('should add amount to fund', async function () {
            const {logs} = await this.mowjowFunds.fund(0, 100, {from: _});
            const event = logs.find(e => e.event === 'AddedBalanceToFund');
            should.exist(event);
            event.args.numberFund.should.be.bignumber.equal(0);
            event.args.addedTokens.should.be.bignumber.equal(100);
            event.args.sumTokensFund.should.be.bignumber.equal(100);
        });

        it('should send amount from fund to address', async function() {
            await this.token.mint(this.mowjowFunds.address, 10000000, {from: _});
            await this.token.changeStatusFinalized({from: _});
            const instance = await this.mowjowFunds.transferToFund(investor, 0, 50, this.token.address, {from: _});
            const newEvent = instance.logs.find(e => e.event === 'SentFromFund');
            should.exist(newEvent);
            newEvent.args.numberFund.should.be.bignumber.equal(0);
            newEvent.args.destination.should.be.bignumber.equal(investor);
            newEvent.args.sentTokens.should.be.bignumber.equal(50);
        })
    })
});
