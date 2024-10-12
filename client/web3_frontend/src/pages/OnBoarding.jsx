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

    // Create a new contract instance with the signer, allowing you to send transactions
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
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
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
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">OnBoarding</h1>
      <div className="space-y-4">
        <button
          onClick={enrollAsStudent}
          className="btn btn-primary w-full max-w-xs"
        >
          Enroll as a Student
        </button>
        <button
          onClick={enrollExaminer}
          className="btn btn-secondary w-full max-w-xs"
        >
          Enroll as an Examiner
        </button>
      </div>
    </div>
  );
};

export default OnBoarding;
