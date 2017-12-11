const helper = require('./helper');
const { setupParams } = require('./helpers/config.json');

const should = helper.should;

contract('MowjowFunds', function ([_, fundWallet, earlyContribStrategy, preIcoStrategy, trancheStrategy, purchaser]) {

    before (async function () {
        await helper.advanceBlock();
    });
    beforeEach(async function () {
        this.val = helper.ether(0.5);
        const [crowdsale, finalize, token] = await helper.setupCrowdsaleSuite(
            setupParams, helper.crowdsaleParams, _, fundWallet
        );
        this.mowjowCrowdsale = crowdsale;
        this.token = token;
        this.finalizableMowjow = finalize;
    });

    describe('Deploy Funds', function () {

        it('Should deploy with fundWallet set to', async function () {
            const wallet = await this.mowjowCrowdsale.wallet();
            wallet.should.be.equal(fundWallet);

        });

        it('Should not allow update trancheStrategy', async function() {
            await this.mowjowCrowdsale.changeTrancheStrategy(trancheStrategy);
            const tranche = await this.mowjowCrowdsale.trancheStrategy();
            tranche.should.be.equal(trancheStrategy);
        });

        it('Should not allow update preIcoStrategy', async function() {
            await this.mowjowCrowdsale.changePreIcoStrategy(preIcoStrategy);
            const preIco = await this.mowjowCrowdsale.preIcoStrategy();
            preIco.should.be.equal(preIcoStrategy);
        });

        it('Should not allow update trancheStrategy', async function() {
            await this.mowjowCrowdsale.changeEarlyContribStrategy(earlyContribStrategy);
            const earlyContributorsPrice = await this.mowjowCrowdsale.earlyContribStrategy();
            earlyContributorsPrice.should.be.equal(earlyContribStrategy);
        });

        it('Should​ ​not​ allow​ ​the​ ​buyTo​​ ​function​ ​to​ ​be​ ​called​ ​to​ ​an​ ​address​ ​of​ ​0​', async function() {
            await this.mowjowCrowdsale.addWhitelistInvestors(purchaser, {from: 0}).should.be.rejectedWith(helper.invalidAddress);
        });
    })
});
