import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Exam from "../contracts/Exam.json";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

const StudentSideExamDetails = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { id } = useParams();
  const [contract, setContract] = useState();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [exam, setExam] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
  });

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contractInstance = new ethers.Contract(id, Exam.abi, signer);

    setContract(contractInstance);
  }, []);

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

    const isStudentEnrolled = async () => {
      const isEnrolled = await contract.isStudentEnrolled(address);
      setIsEnrolled(isEnrolled);
    };

    if (contract) {
      getExamDetails();
      isStudentEnrolled();
    }
  }, [contract]);

  return (
    <>
      {exam.examName ? (
        <div className="card bg-primary text-primary-content w-96">
          <div className="card-body">
            <h2 className="card-title">{exam.examName}</h2>
            <p>exam date: {exam.startTime}</p>
            <p>Last date for enrollment: {exam.lastEnrollmentDate}</p>

            {isEnrolled ? (
              <p>Enrolled</p>
            ) : (
              <button
                className="btn"
                onClick={() => navigate("/student/" + id + "/enrollment")}
              >
                Enroll
              </button>
            )}
          </div>
        </div>
      ) : (
        <span className="loading loading-lg"></span>
      )}
    </>
  );
};

export default StudentSideExamDetails;
