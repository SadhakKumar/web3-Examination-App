import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Calendar,
  Clock,
  FileText,
  ArrowLeft,
  CalendarCheck,
  Info,
  CheckCircle,
} from "lucide-react";

const DeclareExam = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState();
  const [loading, setLoading] = useState(false);
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
    duration: "",
    lastEnrollmentDate: "",
  });

  const [errors, setErrors] = useState({});

  const handleExamDetailChange = (e) => {
    const { name, value } = e.target;
    setExamDetails({
      ...examDetails,
      [name]: value,
    });

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!examDetails.examName.trim()) {
      newErrors.examName = "Exam name is required";
    }

    if (!examDetails.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!examDetails.duration) {
      newErrors.duration = "Duration is required";
    } else if (isNaN(examDetails.duration) || examDetails.duration <= 0) {
      newErrors.duration = "Duration must be a positive number";
    }

    if (!examDetails.lastEnrollmentDate) {
      newErrors.lastEnrollmentDate = "Last enrollment date is required";
    } else if (
      new Date(examDetails.lastEnrollmentDate) >=
      new Date(examDetails.startTime)
    ) {
      newErrors.lastEnrollmentDate =
        "Enrollment deadline must be before exam start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const declareExam = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

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
      setLoading(false);

      // Show success message
      const successMessage = document.getElementById("success-message");
      successMessage.classList.remove("hidden");

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/examiner");
      }, 2000);
    } catch (error) {
      setLoading(false);
      setErrors({
        submit: error.message || "Error declaring exam. Please try again.",
      });
      console.error(error);
    }
  };

  // Function to format date as dd/mm/yyyy
  const formatDate = (date) => {
    return moment(date).format("DD/MM/YYYY HH:mm");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 flex items-center">
        <button
          onClick={() => navigate("/examiner")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white shadow-sm border border-gray-100 rounded-lg w-full max-w-lg p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-customYellow2 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Declare New Examination
            </h2>
          </div>

          {/* Success Message - Hidden by default */}
          <div
            id="success-message"
            className="hidden mb-6 bg-green-50 border border-green-100 rounded-md p-4 flex items-start"
          >
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-green-800 font-medium">
                Exam Declared Successfully
              </h3>
              <p className="text-green-700 text-sm">
                Redirecting to dashboard...
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-md p-4 flex items-start">
              <Info className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Exam Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="examName"
                  value={examDetails.examName}
                  onChange={handleExamDetailChange}
                  className={`w-full pl-10 py-2 border ${
                    errors.examName ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-customYellow2 focus:border-customYellow2`}
                  placeholder="Enter exam name"
                />
              </div>
              {errors.examName && (
                <p className="text-red-600 text-xs">{errors.examName}</p>
              )}
            </div>

            {/* Start Time */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Start Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={examDetails.startTime}
                  onChange={handleExamDetailChange}
                  className={`w-full pl-10 py-2 border ${
                    errors.startTime ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-customYellow2 focus:border-customYellow2`}
                />
              </div>
              {errors.startTime && (
                <p className="text-red-600 text-xs">{errors.startTime}</p>
              )}
              {examDetails.startTime && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Info className="h-3 w-3 mr-1" />
                  {formatDate(examDetails.startTime)}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="duration"
                  value={examDetails.duration}
                  onChange={handleExamDetailChange}
                  className={`w-full pl-10 py-2 border ${
                    errors.duration ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-customYellow2 focus:border-customYellow2`}
                  placeholder="Enter duration in minutes"
                />
              </div>
              {errors.duration && (
                <p className="text-red-600 text-xs">{errors.duration}</p>
              )}
            </div>

            {/* Last Enrollment Date */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Enrollment Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarCheck className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  name="lastEnrollmentDate"
                  value={examDetails.lastEnrollmentDate}
                  onChange={handleExamDetailChange}
                  className={`w-full pl-10 py-2 border ${
                    errors.lastEnrollmentDate
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-customYellow2 focus:border-customYellow2`}
                />
              </div>
              {errors.lastEnrollmentDate && (
                <p className="text-red-600 text-xs">
                  {errors.lastEnrollmentDate}
                </p>
              )}
              {examDetails.lastEnrollmentDate && (
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Info className="h-3 w-3 mr-1" />
                  {formatDate(examDetails.lastEnrollmentDate)}
                </p>
              )}
            </div>

            <button
              className={`w-full bg-customYellow2 text-white font-medium py-2.5 px-4 rounded-md hover:bg-customYellow transition-colors duration-300 mt-6 flex justify-center items-center ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={declareExam}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Declare Exam"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclareExam;
