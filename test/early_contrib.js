const t = require('./helper');

const should = t.should;

const PURCHASE_EVENT = 'Purchase';

contract('EarlyContribStrategy', function ([_, investor, wallet, purchaser]) {
    const value = t.ether(0.0000000000000001);

    const expectedTokenAmount = t.rate.mul(value).mul(2); // 100% bonus

    before(async function () {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await t.advanceBlock()
    });

    beforeEach(async function () {

        this.earlyContribStrategy = await t.EarlyContribStrategy.deployed();
        this.preIcoStrategy = await t.PreIcoStrategy.new(100, 80000, 40000);
        this.trancheStrategy = await t.TrancheStrategy.new([100], [80000], [40000]);
        this.mowjowCrowdsale = await t.MowjowCrowdsale.new(
            t.startTime, t.endTime, t.rate, wallet, t.cap,
            this.earlyContribStrategy.address, this.preIcoStrategy.address,
            this.trancheStrategy.address, t.finalizableMowjow.address);

        let token = await this.mowjowCrowdsale.token();
        this.token = await t.MowjowToken.at(token);
    });

    describe('payments for early contributors', function () {
        beforeEach(async function () {
        });

        it('should add investor to early contributor list successfuly', async function () {
            const { logs }= await this.mowjowCrowdsale.addEarlyContributors(investor, value);

            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event)
        });

        it('should 100% bonus for early contributor', async function () {
            const { logs } = await this.mowjowCrowdsale.addEarlyContributors(investor, value);
            const event = logs.find(e => e.event === PURCHASE_EVENT);
            should.exist(event);
            event.args.beneficiary.should.be.bignumber.equal(investor);
            event.args.value.should.be.bignumber.equal(value);
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
            const balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(expectedTokenAmount)
        });

        it('should reject add to early contributor list after end pre ico', async function () {
            await this.mowjowCrowdsale.addWhitelistInvestors(investor, {from: _});
            await this.mowjowCrowdsale.buyTokens(investor, { value: t.ether(1), from: purchaser });

            await this.mowjowCrowdsale.addEarlyContributors(investor, value).should.be.rejectedWith(t.EVMThrow);
        })
    })
});
