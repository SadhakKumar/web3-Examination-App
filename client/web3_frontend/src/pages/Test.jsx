import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";
import Exam from "../contracts/Exam.json";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import {
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
  Send,
  Loader2,
  FileQuestion,
  CheckCircle,
  Award,
} from "lucide-react";

const Test = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [examCID, setExamCID] = useState("");
  const [testPaper, setTestPaper] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractInstance = new ethers.Contract(id, Exam.abi, signer);
    setContract(contractInstance);
  }, [id]);

  useEffect(() => {
    const getExams = async () => {
      try {
        const examscid = await contract.getExamCID();
        setExamCID(examscid);
      } catch (error) {
        console.error("Error fetching exam CID:", error);
      }
    };

    if (contract) {
      getExams();
    }
  }, [contract]);

  useEffect(() => {
    const getExamFromIPFS = async () => {
      setLoading(true);
      try {
        const encryptedData = await pinata.gateways.get(examCID);

        const data = encryptedData.data.replace(/^"|"$/g, "");
        const decryptedBytes = AES.decrypt(
          data,
          process.env.REACT_APP_SECRET_KEY
        );
        const decryptedQuestions = decryptedBytes.toString(enc.Utf8);
        setTestPaper(JSON.parse(decryptedQuestions));

        // Set a default timer of 60 minutes (adjust as needed)
        setTimeRemaining(60 * 60);
      } catch (error) {
        console.error("Error retrieving exam data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (examCID) {
      getExamFromIPFS();
    }
  }, [examCID]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  // Handle user selection
  const handleOptionChange = (questionId, selectedOption) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: selectedOption,
    });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < testPaper.length) {
      const confirmed = window.confirm(
        "You haven't answered all questions. Are you sure you want to submit?"
      );
      if (!confirmed) return;
    }

    setSubmitLoading(true);
    try {
      const answersCid = await contract.getAnswersCID();

      const encryptedData = await pinata.gateways.get(answersCid);
      const data = encryptedData.data.replace(/^"|"$/g, "");
      const decryptedBytes = AES.decrypt(
        data,
        process.env.REACT_APP_SECRET_KEY
      );
      const decryptedQuestions = decryptedBytes.toString(enc.Utf8);
      const answers = JSON.parse(decryptedQuestions);

      // Evaluate the student's answers
      let score = 0;
      answers.forEach((answer, index) => {
        const studentAnswer = selectedAnswers[index];
        if (answer.answer === studentAnswer) {
          score += 1;
        }
      });
      setScore(score);

      // Encrypt and store the score on the blockchain
      const encryptedScore = AES.encrypt(
        score.toString(),
        process.env.REACT_APP_SECRET_KEY
      ).toString();

      const tx = await contract.gradeStudent(encryptedScore);
      await tx.wait();

      setTimeout(() => {
        navigate("/student");
      }, 3000);
    } catch (error) {
      console.error("Error processing exam submission:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const navigateQuestion = (direction) => {
    if (direction === "next" && currentStep < testPaper.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (direction === "prev" && currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg text-gray-700">Loading examination...</p>
      </div>
    );
  }

  if (score !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Award className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Exam Completed
          </h2>
          <p className="text-gray-600 mb-6">
            Your submission has been recorded successfully.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-lg font-medium text-gray-700">Your score:</p>
            <p className="text-3xl font-bold text-blue-600">
              {score} / {testPaper.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ({((score / testPaper.length) * 100).toFixed(1)}%)
            </p>
          </div>
          <p className="text-gray-600 mb-6">
            You will be redirected to the dashboard shortly.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/student")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with timer */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <FileQuestion className="w-6 h-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">
              Online Examination
            </h1>
          </div>
          {timeRemaining && (
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              <span
                className={`font-mono font-medium ${
                  timeRemaining < 300 ? "text-red-600" : "text-gray-600"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentStep + 1} of {testPaper.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Object.keys(selectedAnswers).length} of {testPaper.length}{" "}
              answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${((currentStep + 1) / testPaper.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question card */}
        {testPaper.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              {currentStep + 1}. {testPaper[currentStep].question}
            </h2>

            <div className="space-y-3 mt-4">
              {JSON.parse(
                testPaper[currentStep].options.replace(/'/g, '"')
              ).map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`flex items-start p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedAnswers[currentStep] === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentStep}`}
                    value={option}
                    checked={selectedAnswers[currentStep] === option}
                    onChange={() => handleOptionChange(currentStep, option)}
                    className="sr-only"
                  />
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                      selectedAnswers[currentStep] === option
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAnswers[currentStep] === option && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => navigateQuestion("prev")}
            disabled={currentStep === 0}
          >
            <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
            Previous
          </button>

          <div>
            {currentStep === testPaper.length - 1 ? (
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Exam
                  </>
                )}
              </button>
            ) : (
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigateQuestion("next")}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Question navigator */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
          <p className="text-sm font-medium text-gray-600 mb-3">
            Question Navigator
          </p>
          <div className="grid grid-cols-8 gap-2 sm:grid-cols-10 md:grid-cols-12">
            {testPaper.map((_, index) => (
              <button
                key={index}
                className={`w-full aspect-square flex items-center justify-center text-sm font-medium rounded ${
                  currentStep === index
                    ? "bg-blue-600 text-white"
                    : selectedAnswers[index] !== undefined
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => setCurrentStep(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
