// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import Exam from "../contracts/Exam.json";
// import { ethers } from "ethers";
// import { useAccount } from "wagmi";
// import { useNavigate } from "react-router-dom";

// const StudentSideExamDetails = () => {
//   const navigate = useNavigate();
//   const { isConnected, address } = useAccount();
//   const { id } = useParams();
//   const [contract, setContract] = useState();
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [exam, setExam] = useState({
//     examName: "",
//     startTime: "",
//     duration: "",
//     lastEnrollmentDate: "",
//   });

//   useEffect(() => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     // Create a new contract instance with the signer
//     const contractInstance = new ethers.Contract(id, Exam.abi, signer);

//     setContract(contractInstance);
//   }, []);

//   useEffect(() => {
//     const getExamDetails = async () => {
//       const name = await contract.name();
//       const startTime = await contract.date();
//       const durationBigNumber = await contract.duration();
//       const duration = durationBigNumber.toNumber();
//       const lastEnrollmentDate = await contract.lastEnrollmentDate();

//       setExam({
//         examName: name,
//         startTime,
//         duration,
//         lastEnrollmentDate,
//       });
//     };

//     const isStudentEnrolled = async () => {
//       const isEnrolled = await contract.isStudentEnrolled(address);
//       setIsEnrolled(isEnrolled);
//     };

//     if (contract) {
//       getExamDetails();
//       isStudentEnrolled();
//     }
//   }, [contract]);

//   return (
//     <>
//       {exam.examName ? (
//         <div className="card bg-primary text-primary-content w-96">
//           <div className="card-body">
//             <h2 className="card-title">{exam.examName}</h2>
//             <p>exam date: {exam.startTime}</p>
//             <p>Last date for enrollment: {exam.lastEnrollmentDate}</p>

//             {isEnrolled ? (
//               <p>Enrolled</p>
//             ) : (
//               <button
//                 className="btn"
//                 onClick={() => navigate("/student/" + id + "/enrollment")}
//               >
//                 Enroll
//               </button>
//             )}
//           </div>
//         </div>
//       ) : (
//         <span className="loading loading-lg"></span>
//       )}
//     </>
//   );
// };

// export default StudentSideExamDetails;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Exam from "../contracts/Exam.json";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  AlertCircleIcon,
} from "lucide-react";

const StudentSideExamDetails = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { id } = useParams();
  const [contract, setContract] = useState();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
    rawStartTime: null,
  });

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contractInstance = new ethers.Contract(id, Exam.abi, signer);
    setContract(contractInstance);
  }, [id]);

  useEffect(() => {
    const getExamDetails = async () => {
      setLoading(true);
      try {
        const name = await contract.name();
        const startTime = await contract.date(); // Get the date
        const durationBigNumber = await contract.duration(); // Get the duration
        const lastEnrollmentDate = await contract.lastEnrollmentDate(); // Get last enrollment date

        console.log("Start Time:", startTime);
        console.log("Duration:", durationBigNumber);
        console.log("Last Enrollment Date:", lastEnrollmentDate);

        const duration = durationBigNumber.toNumber(); // Convert duration to a number

        setExam({
          examName: name,
          startTime: formatDateTime(startTime),
          rawStartTime: startTime,
          duration,
          lastEnrollmentDate: formatDateTime(lastEnrollmentDate),
        });

        // Check if student is enrolled
        const isEnrolled = await contract.isStudentEnrolled(address);
        const isStudentVerified = await contract.isStudentVerified(address);
        setIsVerified(isStudentVerified);
        setIsEnrolled(isEnrolled);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam details:", error);
        setLoading(false);
      }
    };

    if (contract) {
      getExamDetails();
    }
  }, [contract, address]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  // Format date for better display
  const formatDateTime = (dateValue) => {
    if (!dateValue) return "Not specified";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateValue).toLocaleDateString(undefined, options);
  };

  const getExamStatus = () => {
    if (!exam.rawStartTime)
      return { status: "Unknown", color: "bg-gray-100 text-gray-800" };

    const examTime = new Date(exam.rawStartTime).getTime();
    const now = new Date().getTime();
    const endTime = examTime + exam.duration * 60 * 1000;

    if (now < examTime) {
      return { status: "Upcoming", color: "bg-blue-100 text-blue-800" };
    } else if (now >= examTime && now <= endTime) {
      return { status: "In Progress", color: "bg-green-100 text-green-800" };
    } else {
      return { status: "Completed", color: "bg-gray-100 text-gray-800" };
    }
  };

  const examStatus = getExamStatus();
  const timeRemaining = () => {
    if (!exam.rawStartTime) return "Not available";

    const examTime = new Date(exam.rawStartTime).getTime();
    const now = new Date().getTime();

    if (now > examTime) {
      return "Exam has started";
    }

    const diff = examTime - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} days, ${hours} hours, ${minutes} minutes`;
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
                  <BookOpenIcon size={16} className="text-indigo-600" />
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
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/student")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition duration-200"
          >
            <ArrowLeftIcon size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Exam Details</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main exam details card */}
            <div className="md:col-span-2 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {exam.examName}
                  </h2>
                  <p className="text-sm text-gray-500">Examination Details</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${examStatus.color}`}
                >
                  {examStatus.status}
                </span>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CalendarIcon
                      size={20}
                      className="text-indigo-500 mr-3 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Exam Date & Time
                      </h3>
                      <p className="text-gray-600">{exam.startTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ClockIcon
                      size={20}
                      className="text-indigo-500 mr-3 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Duration
                      </h3>
                      <p className="text-gray-600">{exam.duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CalendarIcon
                      size={20}
                      className="text-indigo-500 mr-3 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Last Date for Enrollment
                      </h3>
                      <p className="text-gray-600">{exam.lastEnrollmentDate}</p>
                    </div>
                  </div>

                  {examStatus.status === "Upcoming" && (
                    <div className="flex items-start">
                      <ClockIcon
                        size={20}
                        className="text-indigo-500 mr-3 mt-1 flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">
                          Time Remaining
                        </h3>
                        <p className="text-gray-600">{timeRemaining()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status and actions card */}
            <div className="bg-white shadow rounded-lg overflow-hidden h-min">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  Status & Actions
                </h2>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-6">
                  {/* Enrollment Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      {isEnrolled ? (
                        <CheckCircleIcon
                          size={20}
                          className="text-green-500 mr-2"
                        />
                      ) : (
                        <XCircleIcon size={20} className="text-red-500 mr-2" />
                      )}
                      <h3 className="text-sm font-medium text-gray-800">
                        Enrollment Status
                      </h3>
                    </div>
                    <p
                      className={`text-sm ${
                        isEnrolled ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {isEnrolled
                        ? "You are successfully enrolled in this exam."
                        : "You are not enrolled in this exam."}
                    </p>

                    {!isEnrolled && (
                      <button
                        className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                        onClick={() =>
                          navigate("/student/" + id + "/enrollment")
                        }
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>

                  {/* Verification Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      {isVerified ? (
                        <CheckCircleIcon
                          size={20}
                          className="text-green-500 mr-2"
                        />
                      ) : (
                        <AlertCircleIcon
                          size={20}
                          className="text-amber-500 mr-2"
                        />
                      )}
                      <h3 className="text-sm font-medium text-gray-800">
                        Verification Status
                      </h3>
                    </div>
                    <p
                      className={`text-sm ${
                        isVerified ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {isVerified
                        ? "You are verified for this exam."
                        : "You are not yet verified for this exam. Please contact your administrator."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSideExamDetails;
