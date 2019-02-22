const Migrations = artifacts.require("./Migrations.sol");
const MetaTransactable = artifacts.require("./MetaTransactable.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Migrations);
    await deployer.deploy(MetaTransactable);
};
