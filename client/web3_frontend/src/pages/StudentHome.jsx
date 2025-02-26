// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import studentImg from "./student.png";
// import { useAccount } from "wagmi";
// import { ethers } from "ethers";
// import Declare from "../contracts/Declare.json";
// import Card from "../components/Card";

// const StudentHome = () => {
//   const navigate = useNavigate();
//   const { isConnected } = useAccount();
//   const [declareContract, setDeclareContract] = useState();
//   const [loading, setLoading] = useState(false);
//   const [allExams, setAllExams] = useState([]);

//   useEffect(() => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     // Create a new contract instance with the signer
//     const contractInstance = new ethers.Contract(
//       process.env.REACT_APP_DECLARE_CONTRACT_ADDRESS,
//       Declare.abi,
//       signer
//     );
//     setDeclareContract(contractInstance);
//   }, []);

//   useEffect(() => {
//     const getAllExamsFromContract = async () => {
//       setLoading(true);
//       const allExams = await declareContract.getAllExams();
//       setAllExams(allExams);
//       setLoading(false);
//     };

//     if (declareContract) {
//       getAllExamsFromContract();
//     }
//   }, [declareContract]);

//   useEffect(() => {
//     if (!isConnected) {
//       navigate("/");
//     }
//   }, [isConnected]);

//   return (
//     <>
//       {loading ? (
//         <span className="loading loading-spinner loading-lg"></span>
//       ) : allExams.length === 0 ? (
//         <h1>No exams to Dispaly</h1>
//       ) : (
//         <>
//           <h1>All the Declared exams</h1>
//           {allExams.map((exam, index) => (
//             <div className="card bg-base-100 w-96 shadow-xl" key={index}>
//               <div className="card-body">
//                 <h2 className="card-title">{exam.examName}</h2>
//                 <p>{exam.examDate}</p>
//                 <div className="card-actions justify-end">
//                   <button
//                     className="btn btn-primary"
//                     onClick={() =>
//                       navigate("/student/" + exam.examContractAddress)
//                     }
//                   >
//                     View
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}

//           <button className="btn" onClick={() => navigate("/student/myexams")}>
//             MY Exams
//           </button>
//         </>
//       )}
//     </>
//     // <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-6">
//     //   <div className="bg-white shadow-lg rounded-lg flex w-full max-w-5xl">
//     //     {/* Left Side - Image */}
//     //     <div className="w-1/2 p-6 flex items-center justify-center bg-customYellow2 rounded-l-lg">
//     //       <img
//     //         src={studentImg}
//     //         alt="Student"
//     //         className="w-90 h-80 object-cover rounded-full shadow-md"
//     //       />
//     //     </div>

//     //     {/* Right Side - Content */}
//     //     <div className="w-1/2 p-8 flex flex-col items-center justify-center">
//     //       <h1 className="text-3xl font-bold mb-4 text-customYellow2 text-center">
//     //         Welcome to Student Home
//     //       </h1>
//     //       <p className="text-lg text-gray-700 mb-6 text-center">
//     //         Ready to start your exam?
//     //       </p>
//     //       <button
//     //         onClick={() => navigate("/exam")}
//     //         className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
//     //       >
//     //         Start Exam
//     //       </button>
//     //     </div>
//     //   </div>
//     // </div>
//   );
// };

// export default StudentHome;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import studentImg from "./student.png";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import Declare from "../contracts/Declare.json";
import { CalendarIcon, ClipboardIcon, UserIcon } from "lucide-react";

const StudentHome = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const [declareContract, setDeclareContract] = useState();
  const [loading, setLoading] = useState(false);
  const [allExams, setAllExams] = useState([]);
  const [userName, setUserName] = useState("Student");

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
    const getAllExamsFromContract = async () => {
      setLoading(true);
      try {
        const allExams = await declareContract.getAllExams();
        setAllExams(allExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
      setLoading(false);
    };

    if (declareContract) {
      getAllExamsFromContract();
    }
  }, [declareContract]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
                    : userName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-8 md:flex md:items-center">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center shadow-md">
                {studentImg ? (
                  <img
                    src={studentImg}
                    alt="Student"
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon size={48} className="text-indigo-600" />
                )}
              </div>
            </div>
            <div className="md:w-3/4 md:pl-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600 mb-4">
                Stay on top of your upcoming exams and manage your academic
                schedule. Good luck with your studies!
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/student/myexams")}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  <ClipboardIcon size={16} className="mr-2" />
                  My Exams
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200">
                  <CalendarIcon size={16} className="mr-2" />
                  Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Exams section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Available Exams
            </h2>
            <div className="text-sm text-gray-500">
              {allExams.length} {allExams.length === 1 ? "exam" : "exams"}{" "}
              available
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : allExams.length === 0 ? (
            <div className="bg-white shadow rounded-lg py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardIcon size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">
                No Exams Available
              </h3>
              <p className="text-gray-500">
                Check back later for upcoming exams.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allExams.map((exam, index) => (
                <div
                  key={index}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition duration-200"
                >
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {exam.examName}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        Upcoming
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center mb-3">
                      <CalendarIcon size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {exam.examDate
                          ? formatDate(exam.examDate)
                          : "Date not specified"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Prepare for this exam by reviewing the syllabus and
                      completing practice tests.
                    </p>
                    <button
                      onClick={() =>
                        navigate("/student/" + exam.examContractAddress)
                      }
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Resources", icon: <ClipboardIcon size={20} /> },
              { name: "Past Results", icon: <ClipboardIcon size={20} /> },
              { name: "Support", icon: <UserIcon size={20} /> },
              { name: "Settings", icon: <UserIcon size={20} /> },
            ].map((link, i) => (
              <button
                key={i}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <div className="text-indigo-600">{link.icon}</div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {link.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
