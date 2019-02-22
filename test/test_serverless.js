const MetaTransactable = artifacts.require("./MetaTransactable.sol");
const { signVaultUpdateRequest } = require("../utils");
const ServerlessExecuteUpdateRequest = require("../serverless/execute-update-request");

contract("MetaTransactable serverless", accounts => {
    let admin = accounts[0];
    let m;

    before(async () => {
        m = await MetaTransactable.deployed();
    });

    it("signing and executing", async () => {
        const data = "me no ether and me no care";
        const poorUser = await web3.eth.accounts.create();

        const sig = signVaultUpdateRequest(web3, poorUser.privateKey, 1, data);
        ServerlessExecuteUpdateRequest.testHandler;

        const result = await ServerlessExecuteUpdateRequest.testHandler({
            provider: web3.currentProvider,
            admin,
            contractAddress: m.address,
            event: {
                address: poorUser.address,
                nonce: 1,
                data,
                sig: {
                    v: sig.v,
                    r: sig.r,
                    s: sig.s
                }
            }
        });
        assert.isTrue(result.body.success);

        const vault = (await m.vaults.call(poorUser.address));
        assert.equal(data, vault.data);
        assert.equal(1, vault.nonce);
    });
});
