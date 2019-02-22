const MetraTransactable = artifacts.require("./MetraTransactable.sol");
const { signVaultUpdateRequest } = require("../serverless/utils");
const { shouldFail } = require("openzeppelin-test-helpers");

contract("MetraTransactable", accounts => {
    let admin = accounts[0];
    let userHavingEther = accounts[1];
    let m;

    before(async () => {
        m = await MetraTransactable.deployed();
    });

    it("update vault without meta transaction", async () => {
        const data = "me haz ether and me know it";
        await m.updateVault(data, { from: userHavingEther });
        assert.equal(data, (await m.vaults.call(userHavingEther)).data);
    });

    it("update vault with meta transaction", async () => {
        const data = "me no ether and me no care";
        const poorUser = await web3.eth.accounts.create();
        assert.equal(await web3.eth.getBalance(poorUser.address), 0);
        assert.equal((await m.vaults.call(poorUser.address)).nonce, 0);

        let sig, vault;

        // message signing and delegatedUpdate
        sig = signVaultUpdateRequest(web3, poorUser.privateKey, 1, data);
        assert.equal(await m.validateVaultUpdateRequest.call(
            poorUser.address, 1, data + " bad signature",
            sig.v, sig.r, sig.s,
            { from: admin }), "Invalid signature");
        await shouldFail(m.executeUpdateRequest(poorUser.address, 1, data + " bad signature",
            sig.v, sig.r, sig.s,
            { from: admin }));
        await shouldFail(m.executeUpdateRequest(poorUser.address, 42, data,
            sig.v, sig.r, sig.s,
            { from: admin }));
        await m.executeUpdateRequest(poorUser.address, 1, data,
            sig.v, sig.r, sig.s,
            { from: admin });
        vault = (await m.vaults.call(poorUser.address));
        assert.equal(data, vault.data);
        assert.equal(1, vault.nonce);

        // reusing signature shall fail
        await shouldFail(m.executeUpdateRequest(poorUser.address, 1, data,
            sig.v, sig.r, sig.s,
            { from: admin }));

        // new message signing and delegatedUpdate
        sig = signVaultUpdateRequest(web3, poorUser.privateKey, 2, data + " again");
        await m.executeUpdateRequest(poorUser.address, 2, data + " again",
            sig.v, sig.r, sig.s,
            { from: admin });
        vault = (await m.vaults.call(poorUser.address));
        assert.equal(data + " again", vault.data);
        assert.equal(2, vault.nonce);
    });
});
