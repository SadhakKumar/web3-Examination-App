// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Exam.sol";

contract Declare {
    struct ExamDeclaration {
        string examName;
        string examDate;
        uint examStartTime;
        uint examDuration;
        string examHash;
        address examContractAddress;
        uint creationTime;
        uint enrollmentDuration;
    }

    mapping(string => ExamDeclaration) public declarations;

    // Mapping from owner address to exam declaration
    mapping(address => ExamDeclaration[]) public ownerToExamDeclaration;

    // optimize ?
    mapping(string => mapping(address => bool)) public allExamEnrollment;
    string[] public examHashes;

    // Function to declare an exam
    function declareExam(
        string memory _name,
        string memory _date,
        string memory _lastEnrollmentDate,
        uint _start_time,
        uint _duration,
        string memory _exam_hash,
        uint _enrollment_duration
    ) public {
        examHashes.push(_exam_hash);
        Exam test = new Exam(
            msg.sender,
            _name,
            _date,
            _lastEnrollmentDate,
            _start_time,
            _duration,
            block.timestamp,
            _enrollment_duration
        );

        ExamDeclaration memory newExam = ExamDeclaration(
            _name,
            _date,
            _start_time,
            _duration,
            _exam_hash,
            address(test),
            block.timestamp,
            _enrollment_duration
        );
        declarations[_exam_hash] = newExam;
        allExamEnrollment[_exam_hash][msg.sender] = true;
        ownerToExamDeclaration[msg.sender].push(newExam);
    }

    // Get all Exams declared by the owner
    function getExamsDeclaredByOwner()
        public
        view
        returns (ExamDeclaration[] memory)
    {
        return ownerToExamDeclaration[msg.sender];
    }

    // Function to get the list of all exams
    function getAllExams() public view returns (ExamDeclaration[] memory) {
        uint arrayLength = examHashes.length;
        ExamDeclaration[] memory examArray = new ExamDeclaration[](arrayLength);
        for (uint i = 0; i < arrayLength; i++) {
            examArray[i] = declarations[examHashes[i]];
        }
        return examArray;
    }

    // Function to get the details of a particular exam
    function getExam(
        string memory examHash
    ) public view returns (ExamDeclaration memory) {
        return declarations[examHash];
    }

    // Function to enroll a student to a particular exam
    function enrollStudentToParticularExam(string memory examHash) public {
        allExamEnrollment[examHash][msg.sender] = true;
    }

    // Function to retrieve the list of exams that the student has enrolled in
    function getEnrolledExamsOfStudent()
        public
        view
        returns (ExamDeclaration[] memory)
    {
        uint arrayLength = examHashes.length;
        ExamDeclaration[] memory examArray = new ExamDeclaration[](arrayLength);
        uint j = 0;
        for (uint i = 0; i < arrayLength; i++) {
            if (allExamEnrollment[examHashes[i]][msg.sender]) {
                examArray[j] = declarations[examHashes[i]];
                j++;
            }
        }
        return examArray;
    }
}
