import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
  BookOpenIcon,
} from "lucide-react";

const StudentsMyExams = () => {
  const navigate = useNavigate();
  const [enrolledExams, setEnrolledExams] = useState([]);
  const [declareContract, setDeclareContract] = useState();
  const [loading, setLoading] = useState(false);
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
    setDeclareContract(contractInstance);
  }, []);

  useEffect(() => {
    const getEnrolledExams = async () => {
      setLoading(true);
      try {
        const tx = await declareContract.getEnrolledExamsOfStudent();
        console.log(tx);
        setEnrolledExams(tx);
      } catch (error) {
        console.error("Error fetching enrolled exams:", error);
      }
      setLoading(false);
    };
    if (declareContract) {
      getEnrolledExams();
    }
  }, [declareContract]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

  // Format date for better display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate exam status based on dates
  const getExamStatus = (examDate, duration) => {
    const examTime = new Date(examDate).getTime();
    const now = new Date().getTime();
    const endTime = examTime + duration * 60 * 1000;

    if (now < examTime) {
      return { status: "Upcoming", color: "bg-blue-100 text-blue-800" };
    } else if (now >= examTime && now <= endTime) {
      return { status: "In Progress", color: "bg-green-100 text-green-800" };
    } else {
      return { status: "Completed", color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">
                Exam Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserIcon size={16} className="text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {address
                    ? `${address.substring(0, 6)}...${address.substring(
                        address.length - 4
                      )}`
                    : "Student"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/student")}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition duration-200"
            >
              <ArrowLeftIcon size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              My Enrolled Exams
            </h1>
          </div>
          <span className="text-sm text-gray-500">
            {enrolledExams.filter((exam) => exam.examName !== "").length}{" "}
            {enrolledExams.filter((exam) => exam.examName !== "").length === 1
              ? "exam"
              : "exams"}{" "}
            enrolled
          </span>
        </div>

        {/* Exams content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : enrolledExams.filter((exam) => exam.examName !== "").length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledExams
              .filter((exam) => exam.examName !== "")
              .map((exam, index) => {
                const examStatus = getExamStatus(
                  exam.examDate,
                  exam.examDuration.toNumber()
                );
                return (
                  <div
                    key={index}
                    className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition duration-200"
                  >
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {exam.examName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${examStatus.color}`}
                        >
                          {examStatus.status}
                        </span>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center">
                          <CalendarIcon
                            size={16}
                            className="text-gray-400 mr-2 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-600">
                            Start: {formatDate(exam.examDate)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon
                            size={16}
                            className="text-gray-400 mr-2 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-600">
                            Duration: {exam.examDuration.toNumber()} minutes
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon
                            size={16}
                            className="text-gray-400 mr-2 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-600">
                            Enrollment deadline:{" "}
                            {formatDate(exam.lastEnrollmentDate)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/student/myexams/${exam.examContractAddress}`
                          )
                        }
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                      >
                        <BookOpenIcon size={16} className="mr-2" />
                        View Exam Details
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpenIcon size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">
              No Enrolled Exams
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't enrolled in any exams yet.
            </p>
            <button
              onClick={() => navigate("/student")}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
            >
              <ArrowLeftIcon size={16} className="mr-2" />
              Back to Available Exams
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsMyExams;
