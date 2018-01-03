const helper = require('./helper');
const { setupParams, PURCHASE_EVENT } = require('./helpers/config.json');
const MowjowBounty = artifacts.require('MowjowBounty');
const TranchePricingStrategy = artifacts.require('TranchePricingStrategy');

const should = helper.should;

contract('MowjowBounty', function ([_, ownerContract, hacker, purchaser]) {

    before(async function () {
        await helper.advanceBlock();
    });

    beforeEach(async function () {

        this.mowjowBounty = await MowjowBounty.deployed();
    });

    describe('tests preIcoStrategy for bug-bounty', function () {

        it('should null balance after deploy', async function () {
            const result = await this.mowjowBounty.createTarget({ from: hacker });
            const addressTarget = result.logs[0].args.createdAddress;
            const strategy = TranchePricingStrategy.at(addressTarget);

            let response = await strategy.countTokens({from: hacker, value: helper.ether(0.2)});
            let a = 5;
            // const bal = await web3.eth.getBalance(this.mowjowBounty.address).toNumber();
            // bal.should.be.equal(0);
        });

        // it('should success payment to contract bug-bounty', async function () {
        //     const etherForBounty = 3;
        //     const expectBalance = Number(web3.toWei(etherForBounty, "ether"));
        //     const bal = await web3.eth.getBalance(this.mowjowBounty.address).toNumber();
        //     bal.should.be.equal(0);
        //     await this.mowjowBounty.sendTransaction(
        //         { from: ownerContract, value: web3.toWei(etherForBounty, "ether"), gas: 1000000 });
        //     const bal1 = await web3.eth.getBalance(this.mowjowBounty.address).toNumber();
        //     bal1.should.be.equal(expectBalance);
        // });
        //
        // it('should success setup the contract instance for hacking', async function () {
        //     const result = await this.mowjowBounty.createTarget({ from: hacker });
        //     const addressTarget = result.logs[0].args.createdAddress;
        //     addressTarget.should.be.not.equal(0);
        // });

        // it('should not success hacking the contract', async function () {
        //     const result = await this.mowjowBounty.createTarget({ from: hacker });
        //     const addressTarget = result.logs[0].args.createdAddress;
        //     const contractForHack = await PreIcoStrategy.at(addressTarget);
        //     // const isNotHackedContract = await contractForHack.checkInvariant.call();
        //     // isNotHackedContract.should.be.equal(true);
        //     const r = await contractForHack.compromiseContract.call();
        //     console.log(r)
        //     const isNotHackedContract2 = await contractForHack.checkInvariant.call({from: hacker, gas: 1000000});
        // });
        //
        // it('should success hacking the contract', async function () {
        //     // const result = await this.mowjowBounty.createTarget({ from: hacker });
        //     // const addressTarget = result.logs[0].args.createdAddress;
        //     // const contractForHack = await PreIcoStrategy.at(addressTarget, {from: hacker});
        //     // const r = await contractForHack.compromiseContract();
        //     // console.log(r)
        //     // const isNotHackedContract = await contractForHack.checkInvariant.call();
        //     //isNotHackedContract.should.be.equal(true);
        // });

    })

});
