// import React, { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import { useParams } from "react-router-dom";
// import Exam from "../contracts/Exam.json";
// import Declare from "../contracts/Declare.json";

// export default function StudentEnrollment() {
//   const { id } = useParams();
//   const [contract, setContract] = useState(null);
//   const [declareContract, setDeclareContract] = useState(null);
//   const [studentName, setStudentName] = useState("");
//   const [governmentIDBase64, setGovernmentIDBase64] = useState("");
//   const [marksheetBase64, setMarksheetBase64] = useState("");

//   useEffect(() => {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     const contractInstance = new ethers.Contract(id, Exam.abi, signer);
//     const declareContractInstance = new ethers.Contract(
//       process.env.REACT_APP_DECLARE_CONTRACT_ADDRESS,
//       Declare.abi,
//       signer
//     );

//     setContract(contractInstance);
//     setDeclareContract(declareContractInstance);
//   }, [id]);

//   const handleFileUpload = (e, setBase64Callback) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();

//     reader.readAsDataURL(file); // Convert file to base64
//     reader.onload = () => {
//       setBase64Callback(reader.result); // Set the base64 string
//     };
//     reader.onerror = (error) => {
//       console.error("Error reading file:", error);
//     };
//   };

//   const uploadToIPFS = async (base64Data, fileName) => {
//     const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

//     // Create a new FormData object to send file data in multipart/form-data format
//     const formData = new FormData();

//     // Append the file data and metadata to the form
//     formData.append("file", base64ToBlob(base64Data), fileName);

//     const metadata = JSON.stringify({
//       name: fileName,
//     });

//     formData.append("pinataMetadata", metadata);
//     formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`, // JWT token from Pinata
//       },
//       body: formData, // Send formData
//     });

//     const result = await response.json();
//     if (!response.ok) {
//       throw new Error(`Failed to upload to IPFS: ${result.error}`);
//     }

//     return result.IpfsHash; // Return IPFS hash of the uploaded file
//   };

//   // Helper function to convert Base64 to Blob
//   const base64ToBlob = (base64Data) => {
//     const byteCharacters = atob(base64Data.split(",")[1]); // Decode base64 data
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     return new Blob([byteArray], { type: "application/octet-stream" });
//   };

//   const enrollStudent = async () => {
//     try {
//       const governmentIDBase64ipfs = await uploadToIPFS(
//         governmentIDBase64,
//         "governmentID.pdf"
//       );
//       const marksheetBase64ipfs = await uploadToIPFS(
//         marksheetBase64,
//         "marksheet.pdf"
//       );

//       console.log("Government ID CID:", governmentIDBase64ipfs);
//       console.log("Marksheet CID:", marksheetBase64ipfs);

//       // Now enroll the student on-chain with the obtained CIDs
//       const tx = await contract.enrollStudent(
//         studentName,
//         governmentIDBase64ipfs,
//         marksheetBase64ipfs
//       );
//       await tx.wait();
//       console.log("Student enrolled successfully");

//       // Call the declare contract to enroll the student in the particular exam
//       const examHash = await contract.examHash();
//       const tx2 = await declareContract.enrollStudentToParticularExam(examHash);
//       await tx2.wait();
//       console.log("Student enrolled to particular exam");
//     } catch (error) {
//       console.error("Error enrolling student:", error);
//     }
//   };

//   return (
//     <div className="p-5">
//       <h2 className="text-xl mb-4">Student Enrollment</h2>

//       {/* Student Name Input */}
//       <div className="mb-4">
//         <label className="block text-gray-600 mb-2">Student Name</label>
//         <input
//           type="text"
//           value={studentName}
//           onChange={(e) => setStudentName(e.target.value)}
//           className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
//           placeholder="Enter student name"
//         />
//       </div>

//       {/* Government ID Input */}
//       <div className="mb-4">
//         <label className="block text-gray-600 mb-2">
//           Government ID (PDF/Image)
//         </label>
//         <input
//           type="file"
//           accept=".pdf,.jpg,.jpeg,.png"
//           onChange={(e) => handleFileUpload(e, setGovernmentIDBase64)}
//           className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
//         />
//       </div>

//       {/* Marksheet Input */}
//       <div className="mb-4">
//         <label className="block text-gray-600 mb-2">
//           Marksheet (PDF/Image)
//         </label>
//         <input
//           type="file"
//           accept=".pdf,.jpg,.jpeg,.png"
//           onChange={(e) => handleFileUpload(e, setMarksheetBase64)}
//           className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
//         />
//       </div>

//       <button onClick={enrollStudent} className="btn btn-primary">
//         Upload to IPFS & Enroll
//       </button>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import Exam from "../contracts/Exam.json";
import Declare from "../contracts/Declare.json";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

export default function StudentEnrollment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [declareContract, setDeclareContract] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [governmentIDBase64, setGovernmentIDBase64] = useState("");
  const [marksheetBase64, setMarksheetBase64] = useState("");
  const [canEnroll, setCanEnroll] = useState(true);
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

    const contractInstance = new ethers.Contract(id, Exam.abi, signer);
    const declareContractInstance = new ethers.Contract(
      process.env.REACT_APP_DECLARE_CONTRACT_ADDRESS,
      Declare.abi,
      signer
    );

    setContract(contractInstance);
    setDeclareContract(declareContractInstance);
  }, [id]);

  useEffect(() => {
    const getLastEnrollmentDate = async () => {
      const lastEnrollmentDate = await contract.lastEnrollmentDate();
      const date = new Date(lastEnrollmentDate);
      const currentdateTime = new Date();

      if (currentdateTime > date) {
        setCanEnroll(false);
      } else {
        setCanEnroll(true);
      }
    };

    if (contract) {
      getLastEnrollmentDate();
    }
  }, [contract]);

  const handleFileUpload = (e, setBase64Callback) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file); // Convert file to base64
    reader.onload = () => {
      setBase64Callback(reader.result); // Set the base64 string
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
  };

  const uploadToIPFS = async (base64Data, fileName) => {
    setLoading(true);
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    // Create a new FormData object to send file data in multipart/form-data format
    const formData = new FormData();

    // Append the file data and metadata to the form
    formData.append("file", base64ToBlob(base64Data), fileName);

    const metadata = JSON.stringify({
      name: fileName,
    });

    formData.append("pinataMetadata", metadata);
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`, // JWT token from Pinata
      },
      body: formData, // Send formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to upload to IPFS: ${result.error}`);
    }
    setLoading(false);
    return result.IpfsHash; // Return IPFS hash of the uploaded file
  };

  // Helper function to convert Base64 to Blob
  const base64ToBlob = (base64Data) => {
    const byteCharacters = atob(base64Data.split(",")[1]); // Decode base64 data
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "application/octet-stream" });
  };

  const enrollStudent = async () => {
    try {
      setLoading(true);
      const governmentIDBase64ipfs = await uploadToIPFS(
        governmentIDBase64,
        "governmentID.pdf"
      );
      const marksheetBase64ipfs = await uploadToIPFS(
        marksheetBase64,
        "marksheet.pdf"
      );

      console.log("Government ID CID:", governmentIDBase64ipfs);
      console.log("Marksheet CID:", marksheetBase64ipfs);

      // Now enroll the student on-chain with the obtained CIDs
      const tx = await contract.enrollStudent(
        studentName,
        governmentIDBase64ipfs,
        marksheetBase64ipfs
      );
      await tx.wait();
      console.log("Student enrolled successfully");

      // Call the declare contract to enroll the student in the particular exam
      const examHash = await contract.examHash();
      const tx2 = await declareContract.enrollStudentToParticularExam(examHash);
      await tx2.wait();
      console.log("Student enrolled to particular exam");
      setLoading(false);
      navigate("/student");
    } catch (error) {
      console.error("Error enrolling student:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-5">
      {canEnroll ? (
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
          <h2 className="text-2xl mb-6 font-bold text-center text-customYellow2">
            Student Enrollment
          </h2>

          {/* Student Name Input */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Student Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
              placeholder="Enter student name"
            />
          </div>

          {/* Government ID Input */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">
              Government ID (PDF/Image)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, setGovernmentIDBase64)}
              className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
            />
          </div>

          {/* Marksheet Input */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">
              Marksheet (PDF/Image)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, setMarksheetBase64)}
              className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={enrollStudent}
            className="btn bg-customYellow2 text-white w-full py-2 rounded-lg transition-transform transform hover:scale-105"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              " Upload to IPFS & Enroll"
            )}
            {/* Upload to IPFS & Enroll */}
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
          <h2 className="text-2xl mb-6 font-bold text-center text-customYellow2">
            Enrollment Closed
          </h2>
          <p className="text-gray-600 text-center">
            Enrollment for this exam has been closed.
          </p>
        </div>
      )}
    </div>
  );
}
