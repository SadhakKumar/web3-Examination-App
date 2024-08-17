// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Enrollment {
    struct student {
        string name;
        uint age;
        uint rollno;
        string[] previousExamCID;
    }

    struct examiner {
        string name;
        uint age;
        string organization;
    }

    mapping(address => student) public students;
    mapping(address => examiner) public examiners;

    function enrollStudent(
        string memory _name,
        uint _age,
        uint _rollno // string memory _cid
    ) public {
        address _address = msg.sender;
        string[] memory emptyArray;
        student memory newStudent = student(_name, _age, _rollno, emptyArray);
        students[_address] = newStudent;
    }

    function enrollExaminer(
        string memory _name,
        uint _age,
        string memory organization
    ) public {
        address _address = msg.sender;
        examiner memory newExaminer = examiner(_name, _age, organization);
        examiners[_address] = newExaminer;
    }

    // function getStudentData(address addr) public {}
}
