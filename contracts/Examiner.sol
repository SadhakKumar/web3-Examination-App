// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Examiner {
    struct exam {
        string questions;
        string answers;
        string date;
        string start_time;
        string duration;
        string name;
    }

    struct examReturn {
        string questions;
        string date;
        string start_time;
        string duration;
        string name;
    }

    struct displayExam {
        string name;
        string examHash;
    }

    mapping(string => exam) public exams;
    string[] public keys;
    // exam[] public allExams;

    function createExam(
        string memory _exam_hash,
        string memory _questions,
        string memory _answers,
        string memory date,
        string memory start_time,
        string memory duration,
        string memory name
    ) public {
        exam memory newExam = exam(
            _questions,
            _answers,
            date,
            start_time,
            duration,
            name
        );
        exams[_exam_hash] = newExam;
        keys.push(_exam_hash);
    }

    function getAllExams() public view returns (displayExam[] memory) {
        uint arrayLength = keys.length;
        displayExam[] memory examArray = new displayExam[](arrayLength);
        for (uint i = 0; i < arrayLength; i++) {
            // allExams.push(exams[keys[i]]);
            examArray[i].name = exams[keys[i]].name;
            examArray[i].examHash = keys[i];
        }
        return examArray;
    }

    // Function to retrieve the list of students who enrolled in a specific exam without answers
    function getExam(
        string memory examHash
    ) public view returns (examReturn memory) {
        exam memory exam_with_answers = exams[examHash];
        examReturn memory exam_without_answer = examReturn(
            exam_with_answers.questions,
            exam_with_answers.date,
            exam_with_answers.start_time,
            exam_with_answers.duration,
            exam_with_answers.name
        );
        return exam_without_answer;
    }

    function getExamWithAnswers(
        string memory examHash
    ) public view returns (exam memory) {
        return exams[examHash];
    }
}
