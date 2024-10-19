import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";
import Examiner from "../contracts/Examiner.json";
import ExamEnrollment from "../contracts/ExamEnrollment.json";
import Papa from "papaparse";

const CreateExam = () => {
  const navigate = useNavigate();
  const [examinerContract, setExaminerContract] = useState();
  const [examEnrollmentContract, setExamEnrollmentContract] = useState();
  const [jsonResultQuestions, setJsonResultQuestions] = useState(null);
  const [jsonResultAnswers, setJsonResultAnswers] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const ExaminerContract = new ethers.Contract(
      process.env.REACT_APP_EXAMINER_CONTRACT_ADDRESS,
      Examiner.abi,
      signer
    );
    setExaminerContract(ExaminerContract);

    const ExamEnrollmentContract = new ethers.Contract(
      process.env.REACT_APP_EXAM_ENROLLMENT_CONTRACT_ADDRESS,
      ExamEnrollment.abi,
      signer
    );
    setExamEnrollmentContract(ExamEnrollmentContract);
  }, []);

  const [examDetails, setExamDetails] = useState({
    examName: "",
    startTime: "",
    duration: "",
  });

  const handleExamDetailChange = (e) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log("Exam Details: ", examDetails);
    console.log("Questions: ", jsonResultQuestions);
    console.log("Answers: ", jsonResultAnswers);

    uploadToIPFS();
  };

  const handleFileUpload = (e, value) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (value === "questions") {
            setJsonResultQuestions(result.data);
          } else {
            setJsonResultAnswers(result.data);
          }
        },
      });
    }
  };

  const SECRET_KEY = "6c187bb65c1a4dbf9b3fc8b576a1c2dd";

  const uploadToIPFS = async () => {
    let questioncid = "";
    let answercid = "";
    let hash = "";
    try {
      const combinedString = JSON.stringify({
        examDetails,
        jsonResultQuestions,
        jsonResultAnswers,
      });

      const encoder = new TextEncoder();
      const data = encoder.encode(combinedString);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      hash = hashHex;
      console.log("Hash:", hash);

      const encryptedQuestions = AES.encrypt(
        JSON.stringify(jsonResultQuestions),
        SECRET_KEY
      ).toString();
      const encryptedAnswers = AES.encrypt(
        JSON.stringify(jsonResultAnswers),
        SECRET_KEY
      ).toString();

      const jsonQuestionBlob = new Blob([JSON.stringify(encryptedQuestions)], {
        type: "application/json",
      });
      const jsonAnswerBlob = new Blob([JSON.stringify(encryptedAnswers)], {
        type: "application/json",
      });

      const jsonFile = new File([jsonQuestionBlob], "examData.json");
      const jsonAnswerFile = new File([jsonAnswerBlob], "answerData.json");

      const uploadQuestionResult = await pinata.upload.file(jsonFile);
      questioncid = uploadQuestionResult.IpfsHash;
      const uploadAnswerResult = await pinata.upload.file(jsonAnswerFile);
      answercid = uploadAnswerResult.IpfsHash;

      console.log(uploadQuestionResult.IpfsHash);
      console.log(uploadAnswerResult.IpfsHash);
    } catch (error) {
      alert("Error uploading to IPFS:", error);
      console.log("Error uploading to IPFS:", error);
    }

    try {
      await examinerContract.createExam(
        hash,
        questioncid,
        answercid,
        examDetails.startTime,
        examDetails.startTime,
        examDetails.duration,
        examDetails.examName
      );
      console.log("Exam created successfully!");

      await examEnrollmentContract.createExam(hash);
    } catch (error) {
      alert("Error creating exam:", error);
      console.error("Error creating exam:", error);
    }

    navigate("/examiner");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-customYellow3 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-customYellow2 text-center">
          Create Exam
        </h1>

        {/* Exam Details Input */}
        <div className="mb-6 space-y-4">
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
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Upload CSV Files</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-600 mb-2">Questions CSV</h3>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, "questions")}
                className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
              />
              {jsonResultQuestions && (
                <pre className="bg-gray-100 p-4 mt-4 rounded-lg text-sm">
                  {JSON.stringify(jsonResultQuestions, null, 2)}
                </pre>
              )}
            </div>
            <div>
              <h3 className="text-gray-600 mb-2">Answers CSV</h3>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, "answers")}
                className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
              />
              {jsonResultAnswers && (
                <pre className="bg-gray-100 p-4 mt-4 rounded-lg text-sm">
                  {JSON.stringify(jsonResultAnswers, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default CreateExam;
