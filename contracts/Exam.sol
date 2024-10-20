// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Exam {
    address private owner;
    string public name;
    string public date;
    string public lastEnrollmentDate;
    uint public duration;
    uint public creationTime;
    string public examHash;

    bool public isExamCreated = false;
    string private questionsCID;
    string private answersCID;

    struct student {
        string name;
        string govermentDocument;
        string marksheet;
        bool isVerified;
        bool isEnrolled;
        address studentAddress;
    }
    mapping(address => student) public enrolledStudents;
    address[] public enrolledStudentsArray;
    mapping(address => bool) public verifiers;
    // constructor takes all the exam data and stores them in state variables.
    constructor(
        address _owner,
        string memory _name,
        string memory _date,
        string memory _lastEnrollmentDate,
        uint _examDuration,
        uint _examCreationTime,
        string memory _examHash
    ) {
        owner = _owner;
        name = _name;
        date = _date;
        lastEnrollmentDate = _lastEnrollmentDate;
        duration = _examDuration;
        verifiers[_owner] = true;
        creationTime = _examCreationTime;
        examHash = _examHash;
    }

    // Function for the students to Enroll to a perticular exam
    function enrollStudent(
        string memory _name,
        string memory _govermentDocument,
        string memory _marksheet
    ) public {
        require(
            !enrolledStudents[msg.sender].isEnrolled,
            "You are already enrolled"
        );
        address _address = msg.sender;
        student memory newStudent = student(
            _name,
            _govermentDocument,
            _marksheet,
            false,
            true,
            _address
        );
        enrolledStudents[_address] = newStudent;
        enrolledStudentsArray.push(_address);
    }

    // Get all the students who enrolled in the exam
    function getAllStudents() public view returns (student[] memory) {
        uint256 arrayLength = enrolledStudentsArray.length;
        student[] memory studentArray = new student[](arrayLength);
        for (uint256 i = 0; i < arrayLength; i++) {
            studentArray[i] = enrolledStudents[enrolledStudentsArray[i]];
        }
        return studentArray;
    }

    // Function to add new _verifier
    function addVerifier(address _verifier) public {
        require(owner == msg.sender, "You are not authorized to add verifier");
        verifiers[_verifier] = true;
    }

    // Function to remove the verifier
    function removeVerifier(address _verifier) public {
        require(
            owner == msg.sender,
            "You are not authorized to remove verifier"
        );
        verifiers[_verifier] = false;
    }

    // Function for the verifiers to verify the students
    function verifyStudent(address _studentAddress) public {
        require(verifiers[msg.sender], "You are not authorized to verify");
        enrolledStudents[_studentAddress].isVerified = true;
    }

    // Function to check if student is enrolled or not
    function isStudentEnrolled(
        address _studentAddress
    ) public view returns (bool) {
        return enrolledStudents[_studentAddress].isEnrolled;
    }

    // Function to check if the student is verified or not
    function isStudentVerified(
        address _studentAddress
    ) public view returns (bool) {
        return enrolledStudents[_studentAddress].isVerified;
    }

    // Function to create exam
    function createExam(
        string memory _questionsCID,
        string memory _answersCID
    ) public {
        require(owner == msg.sender, "You are not authorized to create exam");
        require(!isExamCreated, "Exam is already created");

        questionsCID = _questionsCID;
        answersCID = _answersCID;
        isExamCreated = true;
    }

    // Function to get the questions CID
    function getExamCID() public view returns (string memory) {
        return questionsCID;
    }

    // Function to get the exam answers CID
    function getAnswersCID() public view returns (string memory) {
        return answersCID;
    }
}
