import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import { useAccount } from "wagmi";
import { AES, enc } from "crypto-js";
import { useNavigate } from "react-router-dom";

const DeclareExam = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState();
  const { isConnected, address } = useAccount();
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

  const [examDetails, setExamDetails] = useState({
    examName: "",
    startTime: "",
    duration: null,
    lastEnrollmentDate: "",
  });

  const handleExamDetailChange = (e) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value,
    });
  };

  const declareExam = async () => {
    // Check if all fields are filled
    for (const key in examDetails) {
      if (examDetails[key] === "" || examDetails[key] === null) {
        alert("Please fill all fields");
        return;
      }
    }
    const combinedString = JSON.stringify({
      examDetails,
      examiner: address,
    });

    const encoder = new TextEncoder();
    const data = encoder.encode(combinedString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const hash = hashHex;

    try {
      const declare = await contract.declareExam(
        examDetails.examName,
        examDetails.startTime,
        examDetails.lastEnrollmentDate,
        examDetails.duration,
        hash
      );
      await declare.wait();
      alert("Exam declared successfully");
      navigate("/examiner");
    } catch (error) {
      alert("Error declaring exam");
      console.error(error);
    }
  };

  return (
    <>
      <div className="mb-6 space-y-4 m-10">
        {/* Exam Name */}
        <label className="block text-lg text-gray-700 font-semibold">
          Exam Name:
          <input
            type="text"
            name="examName"
            value={examDetails.examName}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Start Time */}
        <label className="block text-lg text-gray-700 font-semibold">
          Start Time:
          <input
            type="datetime-local"
            name="startTime"
            value={examDetails.startTime}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Duration (minutes) */}
        <label className="block text-lg text-gray-700 font-semibold">
          Duration (minutes):
          <input
            type="number"
            name="duration"
            value={examDetails.duration}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Last Enrollment Date */}
        <label className="block text-lg text-gray-700 font-semibold">
          Last Enrollment Date:
          <input
            type="datetime-local"
            name="lastEnrollmentDate"
            value={examDetails.lastEnrollmentDate}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        <button className="btn" onClick={declareExam}>
          Declare Exam
        </button>
      </div>
    </>
  );
};

export default DeclareExam;
