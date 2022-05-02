const composable = artifacts.require("cNFT.sol");
const erc20 = artifacts.require("Erc20.sol");

module.exports = function (deployer) {
  deployer.deploy(composable);
  deployer.deploy(erc20, "MyToken", "srs");
};
