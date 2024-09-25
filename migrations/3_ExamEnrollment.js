const ExamEnrollment = artifacts.require("./ExamEnrollment.sol");

module.exports = function (deployer) {
  deployer.deploy(ExamEnrollment);
};
