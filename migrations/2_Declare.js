const Declare = artifacts.require("./Declare.sol");

module.exports = function (deployer) {
  deployer.deploy(Declare);
};
