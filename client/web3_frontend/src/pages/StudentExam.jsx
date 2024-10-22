import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Exam from "../contracts/Exam.json";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

const StudentExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isConnected, address } = useAccount();
  const [contract, setContract] = useState();
  const [verified, setVerified] = useState(false);
  const [startExam, setStartExam] = useState(false);
  const [student, setStudent] = useState();
  const [exam, setExam] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
  });

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractInstance = new ethers.Contract(id, Exam.abi, signer);
    setContract(contractInstance);
  }, []);

  useEffect(() => {
    if (exam.startTime && exam.duration) {
      const startTime = new Date(exam.startTime);
      const durationInMinutes = exam.duration;
      const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);
      const currentTime = new Date();

      if (currentTime >= startTime && currentTime <= endTime) {
        setStartExam(true);
      } else {
        setStartExam(false);
      }
    }
  }, [exam]);

  useEffect(() => {
    const getExamDetails = async () => {
      const name = await contract.name();
      const startTime = await contract.date();
      const durationBigNumber = await contract.duration();
      const duration = durationBigNumber.toNumber();
      const lastEnrollmentDate = await contract.lastEnrollmentDate();

      setExam({
        examName: name,
        startTime,
        duration,
        lastEnrollmentDate,
      });
    };

    const isStudentVerified = async () => {
      const isVerified = await contract.isStudentVerified(address);
      setVerified(isVerified);
    };

    const getStudentDetails = async () => {
      const student = await contract.getStudent();
      setStudent(student);
    };
    if (contract) {
      getExamDetails();
      isStudentVerified();
      getStudentDetails();
    }
  }, [contract]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);
  return (
    <div className="p-5 flex flex-col items-center bg-customYellow34">
      <h1 className="text-2xl font-semibold mb-4">Exam Status</h1>
      <div className="mb-6">
        <p
          className={`text-lg ${verified ? "text-green-600" : "text-red-600"}`}
        >
          {verified
            ? "You are verified for this exam."
            : "You are not verified for this exam."}
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
      <div className="card bg-white shadow-lg rounded-lg p-4 border border-gray-200 w-96">
        {" "}
        {/* Fixed width */}
        <h3 className="text-lg font-semibold text-customYellow2 mb-2">
          Exam Name
        </h3>
        <p className="text-gray-700 mb-2">{exam.examName}</p>
        <h3 className="text-lg font-semibold text-customYellow2 mb-2">
          Start Time
        </h3>
        <p className="text-gray-700 mb-2">{exam.startTime}</p>
        <h3 className="text-lg font-semibold text-customYellow2 mb-2">
          Duration
        </h3>
        <p className="text-gray-700 mb-2">{exam.duration} minutes</p>
        <h3 className="text-lg font-semibold text-customYellow2 mb-2">
          Last Enrollment Date
        </h3>
        <p className="text-gray-700">{exam.lastEnrollmentDate}</p>
      </div>

      {startExam && verified && student && !student.hasExamGiven ? (
        <button
          className="btn bg-customYellow2 mt-4"
          onClick={() => navigate(`/exam/${id}`)}
        >
          Start Exam
        </button>
      ) : student && student.hasExamGiven ? (
        <div className="">
          <p className="text-lg text-green-600 mt-4">
            You have already given the exam.
          </p>
          <p className="text-lg text-gray-600 mt-4">
            Your score: {student.marks.toNumber()}
          </p>
        </div>
      ) : (
        <p className="text-lg text-red-600 mt-4">
          You are not allowed to give the exam.
        </p>
      )}
    </div>
  );
};

export default StudentExam;
