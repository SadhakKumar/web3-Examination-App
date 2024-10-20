import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";
import Examiner from "../contracts/Examiner.json";
import ExamEnrollment from "../contracts/ExamEnrollment.json";

const CreateExam = ({ ipfs }) => {
  const navigate = useNavigate();
  const [examinerContract, setExaminerContract] = useState();
  const [examEnrollmentContract, setExamEnrollmentContract] = useState();

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create contract instances
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

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
  });

  const [currentAnswer, setCurrentAnswer] = useState("");

  const handleExamDetailChange = (e) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (index, e) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = e.target.value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const addQuestion = () => {
    setQuestions([...questions, currentQuestion]);
    setAnswers({ ...answers, [questions.length]: currentAnswer });
    setCurrentQuestion({ question: "", options: ["", "", "", ""] });
    setCurrentAnswer("");
  };

  const handleSubmit = () => {
    console.log("Exam Details: ", examDetails);
    console.log("Questions: ", questions);
    console.log("Answers: ", answers);

    uploadToIPFS();
    // Logic to handle submitting the exam
  };

  const SECRET_KEY = "6c187bb65c1a4dbf9b3fc8b576a1c2dd";

  const uploadToIPFS = async () => {
    let questioncid = "";
    let answercid = "";
    let hash = "";
    try {
      const combinedString = JSON.stringify({
        examDetails,
        questions,
        answers,
      });

      // Hash the combined string using SHA-256
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
        JSON.stringify(questions),
        SECRET_KEY
      ).toString();
      const encryptedAnswers = AES.encrypt(
        JSON.stringify(answers),
        SECRET_KEY
      ).toString();

      const questionsCid = await ipfs.add(encryptedQuestions)
      const answersCid = await ipfs.add(encryptedAnswers)

      // const jsonQuestionBlob = new Blob([JSON.stringify(encryptedQuestions)], {
      //   type: "application/json",
      // });
      // const jsonAnswerBlob = new Blob([JSON.stringify(encryptedAnswers)], {
      //   type: "application/json",
      // });

      // const jsonFile = new File([jsonQuestionBlob], "examData.json");
      // const jsonAnswerFile = new File([jsonAnswerBlob], "answerData.json");

      // // Upload to IPFS
      // const uploadQuestionResult = await pinata.upload.file(jsonFile);
      // questioncid = uploadQuestionResult.IpfsHash;
      // const uploadAnswerResult = await pinata.upload.file(jsonAnswerFile);
      // answercid = uploadAnswerResult.IpfsHash;

      // console.log(uploadQuestionResult.IpfsHash);
      // console.log(uploadAnswerResult.IpfsHash);
      console.log(questionsCid)
      console.log(answersCid)
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Create Exam</h1>

      {/* Exam Details Input */}
      <div className="mb-6">
        <label className="block mb-2">
          Exam Name:
          <input
            type="text"
            name="examName"
            value={examDetails.examName}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Start Time:
          <input
            type="datetime-local"
            name="startTime"
            value={examDetails.startTime}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Duration (minutes):
          <input
            type="number"
            name="duration"
            value={examDetails.duration}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-1"
          />
        </label>
      </div>

      {/* Question Input */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Question</h2>
        <label className="block mb-2">
          Question:
          <input
            type="text"
            name="question"
            value={currentQuestion.question}
            onChange={handleQuestionChange}
            className="input input-bordered w-full mt-1"
          />
        </label>

        {currentQuestion.options.map((option, index) => (
          <label key={index} className="block mb-2">
            Option {index + 1}:
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e)}
              className="input input-bordered w-full mt-1"
            />
          </label>
        ))}

        <label className="block mb-2">
          Answer:
          <input
            type="text"
            value={currentAnswer}
            onChange={handleAnswerChange}
            className="input input-bordered w-full mt-1"
          />
        </label>

        <button onClick={addQuestion} className="btn btn-secondary mt-4">
          Add Question
        </button>
      </div>

      <button onClick={handleSubmit} className="btn btn-primary">
        Submit Exam
      </button>
    </div>
  );
};

export default CreateExam;
