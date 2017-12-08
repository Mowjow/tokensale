const expectThrow = require('./helpers/expectThrow');
const MowjowToken = artifacts.require('./MowjowToken.sol');
const helper = require('./helper');

const tokenParams = {
    name: 'SomeToken',
    symbol: 'Symb',
    decimals: 18,
    initial_supply: 1
};

contract('MowjowToken', function (accounts) {

    beforeEach(async function () {
        await helper.advanceBlock();
        this.token = await MowjowToken.new(tokenParams.name, tokenParams.symbol,
            tokenParams.decimals, tokenParams.initial_supply);
    });

    it('should start with correct params', async function () {

        const name = await this.token.name(),
            symbol = await this.token.symbol(),
            decimals = await this.token.decimals();

        assert.equal(name, tokenParams.name);
        assert.equal(symbol, tokenParams.symbol);
        assert.equal(decimals, tokenParams.decimals);
    });

    it('should return mintingFinished false after construction', async function () {
        let mintingFinished = await this.token.mintingFinished();

        assert.equal(mintingFinished, false);
    });

    it('should mint a given amount of tokens to a given address', async function () {
        const result = await this.token.mint(accounts[0], 100);
        assert.equal(result.logs[0].event, 'Mint');
        assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
        assert.equal(result.logs[0].args.amount.valueOf(), 100);
        assert.equal(result.logs[1].event, 'Transfer');
        assert.equal(result.logs[1].args.from.valueOf(), 0x0);

        let balance0 = await this.token.balanceOf(accounts[0]);
        assert(balance0, 100);

        let totalSupply = await this.token.totalSupply();
        assert(totalSupply, 100);
    });

    it('should fail to mint after call to finishMinting', async function () {
        await this.token.finishMinting();
        assert.equal(await this.token.mintingFinished(), true);
        await expectThrow(this.token.mint(accounts[0], 100)).should.be.rejectedWith(helper.EVMRevert);
    })
});
