// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ExamEnrollment {

    // Mapping to track exam enrollments for each exam
    // examHash => mapping(student address => bool)
    mapping(string => mapping(address => bool)) public examEnrollments;

    // Array to store the list of students who have enrolled in each exam (optional)
    mapping(string => address[]) public enrolledStudents;

    function enroll(string memory examHash) public {
        // Check if the student has already enrolled using the mapping
        require(!examEnrollments[examHash][msg.sender], "You have already enrolled");

        // Mark the student as enrolled
        examEnrollments[examHash][msg.sender] = true;

        // Optionally, store the student's address for listing purposes
        enrolledStudents[examHash].push(msg.sender);
    }

    // Function to retrieve the list of students who enrolled in a specific exam
    function getEnrolledStudents(string memory examHash) public view returns (address[] memory) {
        return enrolledStudents[examHash];
    }

    function checkEnrollment(string memory examHash) public view returns (bool) {
        return examEnrollments[examHash][msg.sender];
    }

    function createExam(string memory examHash) public {
        examEnrollments[examHash][msg.sender] = true;
    }

    
}