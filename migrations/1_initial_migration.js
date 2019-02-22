const Migrations = artifacts.require("./Migrations.sol");
const MetraTransactable = artifacts.require("./MetraTransactable.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Migrations);
    await deployer.deploy(MetraTransactable);
};
