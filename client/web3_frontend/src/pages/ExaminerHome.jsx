import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import professorImage from "./assistant-professor.png";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import Card from "../components/Card";

const ExaminerHome = () => {
  const navigate = useNavigate();

  const [contract, setContract] = useState();
  const [exams, setExams] = useState([]);
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
    setContract(contractInstance);
  }, []);

  useEffect(() => {
    const getAllExamsByExaminer = async () => {
      setLoading(true);
      const allExams = await contract.getExamsDeclaredByOwner();
      setExams(allExams);
      setLoading(false);
    };

    if (contract) {
      getAllExamsByExaminer();
    }
  }, [contract]);

  const declareExam = async () => {
    navigate("/examiner/declare");
  };

  return (
    <>
      {loading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : (
        exams.map((exam, index) => <Card exam={exam} key={index} />)
      )}

      <div>
        <button
          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
          onClick={declareExam}
        >
          Declare Exam
        </button>
      </div>
    </>
    // <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-6">
    //   <div className="bg-white shadow-lg rounded-lg flex w-full max-w-5xl">
    //     {/* Left Side - Image */}
    //     <div className="w-1/2 p-6 flex items-center justify-center bg-customYellow2 rounded-l-lg">
    //       <img
    //         src={professorImage}
    //         alt="Professor"
    //         className="w-90 h-80 object-cover rounded-full shadow-md"
    //       />
    //     </div>

    //     {/* Right Side - Content */}
    //     <div className="w-1/2 p-8 flex flex-col items-center justify-center">
    //       <h1 className="text-4xl mb-4 font-extrabold text-customYellow2 text-center">
    //         Examiner Home
    //       </h1>
    //       <p className="text-xl text-gray-600 mb-6 text-center">
    //         Welcome to the Exam Management System!
    //       </p>
    //       <button
    //         onClick={() => navigate("/examiner/create")}
    //         className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
    //       >
    //         Create Exam
    //       </button>
    //     </div>
    //   </div>
    // </div>
  );
};

export default ExaminerHome;
