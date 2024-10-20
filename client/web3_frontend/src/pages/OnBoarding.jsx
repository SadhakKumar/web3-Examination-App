import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Enrollment from "../contracts/Enrollment.json";

const OnBoarding = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState();

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractInstance = new ethers.Contract(
      process.env.REACT_APP_ENROLLMENT_CONTRACT_ADDRESS,
      Enrollment.abi,
      signer
    );
    setContract(contractInstance);
  }, []);

  const enrollAsStudent = async () => {
    if (window.ethereum) {
      try {
        const tx = await contract.enrollStudent("sadiya", "20", "51");
        await tx.wait();
        console.log("Enrollment successful!");
        navigate("/");
      } catch (error) {
        console.error("Error enrolling student:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
  };

  const enrollExaminer = async () => {
    if (window.ethereum) {
      try {
        const tx = await contract.enrollExaminer("vineah", "20", "JEE");
        await tx.wait();
        console.log("Enrollment successful!");
        navigate("/");
      } catch (error) {
        console.error("Error enrolling examiner:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
  };

  const nextTick = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-customYellow2 mb-6">
          Onboarding
        </h1>
        <div className="space-y-4">
          <button
            onClick={enrollAsStudent}
            className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
          >
            Enroll as a Student
          </button>
          <button
            onClick={enrollExaminer}
            className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
          >
            Enroll as an Examiner
          </button>
          <button
            onClick={nextTick}
            className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;
