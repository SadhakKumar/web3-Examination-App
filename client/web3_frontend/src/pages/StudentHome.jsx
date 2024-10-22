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

const StudentHome = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [declareContract, setDeclareContract] = useState();
  const [loading, setLoading] = useState(false);
  const [allExams, setAllExams] = useState([]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-customYellow3 p-6">
      <div className="bg-white shadow-lg rounded-lg flex w-full max-w-5xl">
        {/* Left Side - Image */}
        <div className="w-1/3 p-6 flex items-center justify-center bg-customYellow2 rounded-l-lg">
          <img
            src={studentImg}
            alt="Student"
            className="w-60 h-60 object-cover rounded-full shadow-md" // Adjusted size for the image
          />
        </div>

        {/* Right Side - Content */}
        <div className="w-2/3 p-8 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4 text-customYellow2 text-center">
            Welcome to Student Home
          </h1>
          <p className="text-lg text-gray-700 mb-6 text-center">
            Ready to start your exam?
          </p>

          {loading ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : allExams.length === 0 ? (
            <h1 className="text-xl text-gray-600">No exams to display</h1>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">All Declared Exams</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {allExams.map((exam, index) => (
                  <div
                    className="card bg-base-100 shadow-xl border border-gray-300 rounded-lg flex flex-col items-center text-center"
                    key={index}
                  >
                    <div className="card-body">
                      <h2 className="card-title text-xl font-semibold text-gray-800">
                        {exam.examName}
                      </h2>
                      <p className="text-md text-gray-600">{exam.examDate}</p>
                      <div className="card-actions justify-center mt-4">
                        <button
                          className="btn"
                          style={{
                            backgroundColor: "#F59E0B",
                            color: "#FFFFFF",
                          }} // customYellow2 color
                          onClick={() =>
                            navigate("/student/" + exam.examContractAddress)
                          }
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            className="btn mt-6"
            style={{ backgroundColor: "#F59E0B", color: "#FFFFFF" }} // customYellow2 color
            onClick={() => navigate("/student/myexams")}
          >
            My Exams
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
