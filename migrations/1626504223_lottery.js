var Lottery = artifacts.require("./Lottery.sol")

module.exports = function(_deployer) {
  _deployer.deploy(Lottery)
};
