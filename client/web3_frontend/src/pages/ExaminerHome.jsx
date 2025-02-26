// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import professorImage from "./assistant-professor.png";
// import { ethers } from "ethers";
// import Declare from "../contracts/Declare.json";
// import Card from "../components/Card";

// const ExaminerHome = () => {
//   const navigate = useNavigate();

//   const [contract, setContract] = useState();
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     // Create a new contract instance with the signer
//     const contractInstance = new ethers.Contract(
//       process.env.REACT_APP_DECLARE_CONTRACT_ADDRESS,
//       Declare.abi,
//       signer
//     );

//     setContract(contractInstance);
//   }, []);

//   useEffect(() => {
//     const getAllExamsByExaminer = async () => {
//       setLoading(true);
//       const allExams = await contract.getExamsDeclaredByOwner();
//       setExams(allExams);
//       setLoading(false);
//     };

//     if (contract) {
//       getAllExamsByExaminer();
//     }
//   }, [contract]);

//   const declareExam = async () => {
//     navigate("/examiner/declare");
//   };

//   return (
//     <>
//       {loading ? (
//         <span className="loading loading-spinner loading-lg"></span>
//       ) : exams.length === 0 ? (
//         <p>no exams yet</p>
//       ) : (
//         exams.map((exam, index) => <Card exam={exam} key={index} />)
//       )}

//       <div>
//         <button
//           className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
//           onClick={declareExam}
//         >
//           Declare Exam
//         </button>
//       </div>
//     </>
//   );
// };

// export default ExaminerHome;

//  <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-6">
//   <div className="bg-white shadow-lg rounded-lg flex w-full max-w-5xl">
//     {/* Left Side - Image */}
//     <div className="w-1/2 p-6 flex items-center justify-center bg-customYellow2 rounded-l-lg">
//       <img
//         src={professorImage}
//         alt="Professor"
//         className="w-90 h-80 object-cover rounded-full shadow-md"
//       />
//     </div>

//     {/* Right Side - Content */}
//     <div className="w-1/2 p-8 flex flex-col items-center justify-center">
//       <h1 className="text-4xl mb-4 font-extrabold text-customYellow2 text-center">
//         Examiner Home
//       </h1>
//       <p className="text-xl text-gray-600 mb-6 text-center">
//         Welcome to the Exam Management System!
//       </p>
//       <button
//         onClick={() => navigate("/examiner/create")}
//         className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
//       >
//         Create Exam
//       </button>
//     </div>
//   </div>
// </div>

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import professorImage from "./assistant-professor.png";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import { useAccount } from "wagmi";
import {
  Plus,
  CalendarDays,
  Clock,
  ClipboardList,
  FileText,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";

const ExaminerHome = () => {
  const navigate = useNavigate();

  const [contract, setContract] = useState();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isConnected } = useAccount();

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

  useEffect(() => {
    const getAllExamsByExaminer = async () => {
      setLoading(true);
      try {
        const allExams = await contract.getExamsDeclaredByOwner();
        setExams(allExams);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };

    if (contract) {
      getAllExamsByExaminer();
    }
  }, [contract]);

  const declareExam = () => {
    navigate("/examiner/declare");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md w-full max-w-5xl p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10 border-b pb-6">
          <div className="flex items-center">
            <img
              src={professorImage}
              alt="Professor"
              className="w-16 h-16 object-cover rounded-full shadow-sm"
            />
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-800">
                Examiner Portal
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage and monitor your examinations
              </p>
            </div>
          </div>
          <button
            onClick={declareExam}
            className="bg-customYellow2 text-white py-2 px-6 rounded-md hover:bg-customYellow transition-all duration-300 flex items-center shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Declare New Exam
          </button>
        </div>

        {/* Exams Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Your Examinations
            </h2>
            <div className="text-sm text-gray-500 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>
                {exams.length} {exams.length === 1 ? "exam" : "exams"} declared
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 text-customYellow2 animate-spin mb-3" />
              <p className="text-gray-500">Loading your examinations...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-10 text-center border border-gray-100">
              <ClipboardList className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-gray-700 font-medium mb-2">
                No Examinations Found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't declared any examinations yet.
              </p>
              <button
                onClick={declareExam}
                className="text-customYellow2 hover:text-customYellow border border-customYellow2 hover:border-customYellow px-6 py-2 rounded-md transition-colors duration-300 flex items-center justify-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Exam
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg overflow-hidden"
                >
                  <div className="border-b border-gray-50 bg-gray-50 p-4">
                    <h3 className="text-lg font-medium text-gray-800 truncate">
                      {exam.examName}
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarDays className="h-4 w-4 mr-3 text-gray-500" />
                        <span>
                          Exam: {new Date(exam.examDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-3 text-gray-500" />
                        <span>
                          Duration: {exam.examDuration.toNumber()} Minutes
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                        <span>
                          Enrollment:{" "}
                          {new Date(
                            exam.lastEnrollmentDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {new Date(exam.lastEnrollmentDate) < new Date() && (
                        <div className="flex items-center text-sm text-amber-600 mt-3 pt-2 border-t border-gray-100">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span>Enrollment closed</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="w-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-md transition-colors duration-300 border border-gray-100 mt-2"
                      onClick={() =>
                        navigate(`/examiner/exam/${exam.examContractAddress}`)
                      }
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminerHome;
