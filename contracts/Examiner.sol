// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Examiner {

  struct exam {
    string questions;
    string answers;
    string date;
    string start_time;
    string end_time;
    string category;

  }

  mapping(string => exam) public exams;
  string[] public keys;
  // exam[] public allExams;


  function createExam(string memory _exam_hash, string memory _questions, string memory _answers, string memory date, string memory start_time, string memory end_time, string memory category) public {
    exam memory newExam = exam(_questions, _answers, date, start_time, end_time, category);
    exams[_exam_hash] = newExam;
    keys.push(_exam_hash);
  }

  function getAllExams() view public returns (exam[] memory){
    uint arrayLength = keys.length;
    exam[] memory examss = new exam[](arrayLength);  // Memory array with fixed size
    for (uint i=0; i<arrayLength; i++) {
      // allExams.push(exams[keys[i]]);
      examss[i] = exams[keys[i]];
    }
    return examss;
  }


}