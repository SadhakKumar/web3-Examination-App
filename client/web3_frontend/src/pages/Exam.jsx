import React, { useState, useEffect } from "react";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";
import { ethers } from "ethers";
import Examiner from "../contracts/Examiner.json";
import { useNavigate } from "react-router-dom";

const Exam = () => {
  const [exam, setExam] = useState();
  const [contract, setContract] = useState();
  const [exams, setExams] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Create Exam Page");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer, allowing you to send transactions
    let contract = new ethers.Contract(
      process.env.REACT_APP_EXAMINER_CONTRACT_ADDRESS,
      Examiner.abi,
      signer
    );
    setContract(contract);
  }, []);

  useEffect(() => {
    const getExams = async () => {
      try {
        const exams = await contract.getAllExams();
        console.log(exams);
        setExams(exams);
      } catch (error) {
        console.log("Error getting exams:", error);
      }
    };
    if (contract) getExams();
  }, [contract]);

  const handleClick = (examHash) => () => {
    navigate(`/exam/${examHash}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6">All Listed Exams</h1>
      <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
        {exams &&
          exams.map((exam, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-4 text-center"
            >
              <h2 className="text-xl font-semibold">{exam.name}</h2>
              <button
                onClick={handleClick(exam.examHash)}
                className="btn btn-primary mt-2"
              >
                View Exam
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Exam;
