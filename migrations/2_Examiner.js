const Examiner = artifacts.require("./Examiner.sol");

module.exports = function (deployer) {
  deployer.deploy(Examiner);
};
