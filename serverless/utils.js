module.exports = {
    Web3: require("web3"),

    signVaultUpdateRequest: function (web3, privateKey, nonce, data) {
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        const msg = web3.eth.abi.encodeParameters(["uint64", "string"], [nonce, data]);
        const msgHash = web3.utils.sha3(msg);
        const sig = account.sign(msgHash);
        return sig;
    }
};
