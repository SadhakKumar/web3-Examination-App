import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import moment from "moment"; // Import moment for date formatting

const DeclareExam = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

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

  // Function to format date as dd/mm/yyyy
  const formatDate = (date) => {
    return moment(date).format("DD/MM/YYYY HH:mm");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-customYellow3 p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-customYellow2">
          Declare New Exam
        </h2>

        <div className="space-y-6">
          {/* Exam Name */}
          <label className="block text-lg text-gray-700 font-semibold">
            Exam Name:
            <input
              type="text"
              name="examName"
              value={examDetails.examName}
              onChange={handleExamDetailChange}
              className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customYellow"
            />
          </label>

          {/* Start Time */}
          <label className="block text-lg text-gray-700 font-semibold">
            Start Time (dd/mm/yyyy):
            <input
              type="datetime-local"
              name="startTime"
              value={examDetails.startTime}
              onChange={handleExamDetailChange}
              className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customYellow"
            />
            {examDetails.startTime && (
              <p className="text-sm text-gray-500 mt-2">
                Selected Start Time: {formatDate(examDetails.startTime)}
              </p>
            )}
          </label>

          {/* Duration (minutes) */}
          <label className="block text-lg text-gray-700 font-semibold">
            Duration (minutes):
            <input
              type="number"
              name="duration"
              value={examDetails.duration}
              onChange={handleExamDetailChange}
              className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customYellow"
            />
          </label>

          {/* Last Enrollment Date */}
          <label className="block text-lg text-gray-700 font-semibold">
            Last Enrollment Date (dd/mm/yyyy):
            <input
              type="datetime-local"
              name="lastEnrollmentDate"
              value={examDetails.lastEnrollmentDate}
              onChange={handleExamDetailChange}
              className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customYellow"
            />
            {examDetails.lastEnrollmentDate && (
              <p className="text-sm text-gray-500 mt-2">
                Selected Enrollment Date:{" "}
                {formatDate(examDetails.lastEnrollmentDate)}
              </p>
            )}
          </label>

          <button
            className="w-full bg-customYellow2 text-white font-bold py-3 px-4 rounded-lg hover:bg-customYellow transition-transform transform hover:scale-105"
            onClick={declareExam}
          >
            Declare Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeclareExam;
