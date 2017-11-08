var expectThrow = require('./helpers/expectThrow');
var MowjowToken = artifacts.require('./MowjowToken.sol');

contract('MowjowToken', function (accounts) {
    let token;

    beforeEach(async function () {
        token = await MowjowToken.new();
    });

    it('should start with correct params', async function () {
        let expectName = 'MowjowToken',
            name,
            expectSymbol = 'MJT',
            symbol,
            expectDecimals = 18,
            decimals,
            expectEdtotalSupply = 75 * 1e8,
            totalSupply;

        name = await token.name();
        symbol = await token.symbol();
        decimals = await token.decimals();
        totalSupply = await token.totalSupply();

        assert.equal(name, expectName);
        assert.equal(symbol, expectSymbol);
        assert.equal(decimals, expectDecimals);
        assert.equal(totalSupply.toNumber(), expectEdtotalSupply);
    });

    it('should return mintingFinished false after construction', async function () {
        let mintingFinished = await token.mintingFinished();

        assert.equal(mintingFinished, false);
    });

    it('should mint a given amount of tokens to a given address', async function () {
        const result = await token.mint(accounts[0], 100);
        assert.equal(result.logs[0].event, 'Mint');
        assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
        assert.equal(result.logs[0].args.amount.valueOf(), 100);
        assert.equal(result.logs[1].event, 'Transfer');
        assert.equal(result.logs[1].args.from.valueOf(), 0x0);

        let balance0 = await token.balanceOf(accounts[0]);
        assert(balance0, 100);

        let totalSupply = await token.totalSupply();
        assert(totalSupply, 100);
    })

    it('should fail to mint after call to finishMinting', async function () {
        await token.finishMinting();
        assert.equal(await token.mintingFinished(), true);
        await expectThrow(token.mint(accounts[0], 100));
    })

});
