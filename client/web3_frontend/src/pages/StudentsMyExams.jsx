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
  const { isConnected } = useAccount();

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
      console.log(tx);
      setEnrolledExams(tx);
      setLoading(false);
    };
    if (declareContract) {
      getEnrolledExams();
    }
  }, [declareContract]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

  return (
    <div className="p-5 bg-customYellow3">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Enrolled Exams
      </h1>
      {loading ? (
        <span className="loading loading-lg"></span>
      ) : enrolledExams.length > 0 ? (
        <div className="flex flex-wrap justify-center">
          {enrolledExams
            .filter((exam) => exam.examName !== "")
            .map((exam, index) => (
              <div
                className="card bg-white shadow-lg w-80 m-4 rounded-lg border border-gray-200 transition-transform transform hover:scale-105"
                key={index}
              >
                <div className="card-body">
                  <h2 className="card-title text-customYellow2 text-lg font-semibold">
                    {exam.examName}
                  </h2>
                  <p className="text-gray-600">
                    <strong>Start Time:</strong> {exam.examDate}
                  </p>
                  <p className="text-gray-600">
                    <strong>Duration:</strong> {exam.examDuration.toNumber()}{" "}
                    minutes
                  </p>
                  <p className="text-gray-600">
                    <strong>Last Enrollment:</strong> {exam.lastEnrollmentDate}
                  </p>
                  <div className="card-actions justify-center">
                    <button
                      className="btn bg-customYellow2 mt-4"
                      onClick={() =>
                        navigate(`/student/myexams/${exam.examContractAddress}`)
                      }
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <h1 className="text-center text-gray-600">No exams to display</h1>
      )}
    </div>
  );
};

export default StudentsMyExams;
