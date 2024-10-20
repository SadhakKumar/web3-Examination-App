const Exam = artifacts.require("./Exam.sol");

module.exports = function (deployer) {
  deployer.deploy(
    Exam,
    "0x37314c07BBe6bAfe71DC4CCC3bb34F0E925494a8",
    "abc",
    "date",
    "_lastEnrollmentDate",
    0,
    0
  );
};
