const t = require('./helper');
const should = t.should;
const config = require('../migrations/config.json');

contract('TrancheStrategy', function ([_, investor, crowdsaleAddress]) {
    const TRANCHE_BONUSES = [100, 100];
    const TRANCHE_RATES = [40000, 40000];
    const TRANCHE_VALUES = [80000e18, 80000e18];

    before(async function () {
        await t.advanceBlock();
        TrancheStrategy = artifacts.require('TrancheStrategy');
        this.trancheStrategy = await TrancheStrategy.new(
            TRANCHE_BONUSES, TRANCHE_VALUES,
            TRANCHE_RATES, {from: crowdsaleAddress});

        await this.trancheStrategy.setCrowdsaleAddress(crowdsaleAddress, {from: crowdsaleAddress});

    });

    describe('payments in pre ico for whitelist investors', function () {

        it('Should not have empty tranches', async function () {
            const hasEmpty = await this.trancheStrategy.isNoEmptyTranches();
            assert.equal(hasEmpty, false);
        });

        it('Should count tokens with 100% bonus', async function () {
            const etherAmount = t.ether(1);
            const {logs} = await this.trancheStrategy.countTokens(etherAmount, {from: crowdsaleAddress});
            const event = logs.find(e => e.event === 'TokenForInvestor');
            should.exist(event);
            event.args._tokenAndBonus.should.be.bignumber.equal(80000e18);
        });
    })

});
