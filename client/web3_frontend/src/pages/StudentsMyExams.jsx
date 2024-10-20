import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import { useNavigate } from "react-router-dom";

const StudentsMyExams = () => {
  const navigate = useNavigate();
  const [enrolledExams, setEnrolledExams] = useState([]);
  const [declareContract, setDeclareContract] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contractInstance = new ethers.Contract(
      process.env.REACT_APP_DECLARE_CONTRACT_ADDRESS,
      Declare.abi,
      signer
    );
    setDeclareContract(contractInstance);
  }, []);

  useEffect(() => {
    const getEnrolledExams = async () => {
      setLoading(true);
      const tx = await declareContract.getEnrolledExamsOfStudent();
      setEnrolledExams(tx);
      setLoading(false);
    };
    if (declareContract) {
      getEnrolledExams();
    }
  }, [declareContract]);

  return (
    <>
      {enrolledExams.length > 0 ? (
        <>
          <h1>Enrolled Exams</h1>
          {enrolledExams.map((exam, index) => (
            <div className="card bg-base-100 w-96 shadow-xl" key={index}>
              <div className="card-body">
                <h2>name : {exam.examName}</h2>
                <p>start time :{exam.examDate}</p>
                <p>duration : {exam.examDuration.toNumber()}</p>
                <p>last Enrollment: {exam.lastEnrollmentDate}</p>
                <button
                  className="btn"
                  onClick={() =>
                    navigate(`/student/myexams/${exam.examContractAddress}`)
                  }
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <h1>No exams to Display</h1>
      )}
    </>
  );
};

export default StudentsMyExams;
