const TruffleContract = require("truffle-contract");

module.exports = {
    Web3HDWalletProvider : require("web3-hdwallet-provider"),
    MetaTransactable: TruffleContract(require("../build/contracts/MetaTransactable.json")),
};
