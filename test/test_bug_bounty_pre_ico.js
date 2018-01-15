const helper = require('./helper');
const MowjowBounty = artifacts.require('MowjowBounty');
const TranchePricingStrategy = artifacts.require('TranchePricingStrategy');

const should = helper.should;

contract('MowjowBounty', function ([_, ownerContract, hacker, purchaser]) {

    // before(async function () {
    //     await helper.advanceBlock();
    // });
    //
    // beforeEach(async function () {
    //
    //     this.mowjowBounty = await MowjowBounty.deployed();
    // });
    //
    // describe('tests preIcoStrategy for bug-bounty', function () {
    //
    //     it('should null balance after deploy', async function () {
    //         const result = await this.mowjowBounty.createTarget({ from: hacker });
    //         const addressTarget = result.logs[0].args.createdAddress;
    //         const strategy = TranchePricingStrategy.at(addressTarget);
    //         const bal = await web3.eth.getBalance(strategy.address).toNumber();
    //         bal.should.be.equal(0);
    //     });
    //
    //     it('should success payment to contract bug-bounty', async function () {
    //         const result = await this.mowjowBounty.createTarget({ from: hacker });
    //         const addressTarget = result.logs[0].args.createdAddress;
    //         const strategy = TranchePricingStrategy.at(addressTarget);
    //
    //         let response = await strategy.payContract({from: hacker, value: helper.ether(0.00002)});
    //         const bal = await web3.eth.getBalance(strategy.address).toNumber();
    //         bal.should.be.bignumber.equal(helper.ether(0.00002));
    //     });
    //
    // })

});
