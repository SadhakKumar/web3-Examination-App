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

const StudentSideExamDetails = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { id } = useParams();
  const [contract, setContract] = useState();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [exam, setExam] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
  });

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contractInstance = new ethers.Contract(id, Exam.abi, signer);
    setContract(contractInstance);
  }, []);

  useEffect(() => {
    const getExamDetails = async () => {
      try {
        const name = await contract.name();
        const startTime = await contract.date(); // Get the date
        const durationBigNumber = await contract.duration(); // Get the duration
        const lastEnrollmentDate = await contract.lastEnrollmentDate(); // Get last enrollment date

        console.log("Start Time:", startTime);
        console.log("Duration:", durationBigNumber);
        console.log("Last Enrollment Date:", lastEnrollmentDate);

        const formattedStartTime = new Date(startTime).toLocaleDateString(); // Format the date if it's in Unix timestamp
        const formattedLastEnrollmentDate = new Date(
          lastEnrollmentDate
        ).toLocaleDateString(); // Format the last enrollment date

        const duration = durationBigNumber.toNumber(); // Convert duration to a number

        setExam({
          examName: name,
          startTime: formattedStartTime,
          duration,
          lastEnrollmentDate: formattedLastEnrollmentDate,
        });
      } catch (error) {
        console.error("Error fetching exam details:", error);
      }
    };

    const isStudentEnrolled = async () => {
      const isEnrolled = await contract.isStudentEnrolled(address);
      const isStudentVerified = await contract.isStudentVerified(address);
      setIsVerified(isStudentVerified);
      setIsEnrolled(isEnrolled);
    };

    if (contract) {
      getExamDetails();
      isStudentEnrolled();
    }
  }, [contract]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-6">
      <div className="card bg-white shadow-lg rounded-lg w-96">
        {exam.examName ? (
          <div className="card-body">
            <h2 className="card-title text-center text-customYellow2">
              {exam.examName}
            </h2>
            <p className="text-md text-gray-700">Exam Date: {exam.startTime}</p>
            <p className="text-md text-gray-700">
              Last Date for Enrollment: {exam.lastEnrollmentDate}
            </p>
            <p className="text-md text-gray-700">
              Duration: {exam.duration} minutes
            </p>

            {isEnrolled ? (
              <p className="text-lg text-green-600 text-center">Enrolled</p>
            ) : (
              <div className="flex justify-center">
                <button
                  className="btn mt-4 "
                  style={{ backgroundColor: "#F59E0B", color: "#FFFFFF" }} // Custom Yellow2
                  onClick={() => navigate("/student/" + id + "/enrollment")}
                >
                  Enroll
                </button>
              </div>
            )}

            {!isVerified ? (
              <p className="text-lg text-red-600 text-center mt-4">
                You are not verified for this exam.
              </p>
            ) : (
              <p className="text-lg text-green-600 text-center mt-4">
                You are verified for this exam.
              </p>
            )}
          </div>
        ) : (
          <span className="loading loading-lg"></span>
        )}
      </div>
    </div>
  );
};

export default StudentSideExamDetails;
