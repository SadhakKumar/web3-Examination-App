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
import {
  User,
  FileText,
  Award,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader,
  ClipboardCheck,
} from "lucide-react";

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
  const [enrollmentDeadline, setEnrollmentDeadline] = useState("");
  const [fileStatus, setFileStatus] = useState({
    governmentID: false,
    marksheet: false,
  });
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

  useEffect(() => {
    const getLastEnrollmentDate = async () => {
      if (!contract) return;

      try {
        const lastEnrollmentDate = await contract.lastEnrollmentDate();
        const date = new Date(lastEnrollmentDate);

        const currentDateTime = new Date();
        // Format date for display
        setEnrollmentDeadline(formatDateTime(date));

        // Check if enrollment is still open
        if (currentDateTime > date) {
          setCanEnroll(false);
        } else {
          setCanEnroll(true);
        }
      } catch (error) {
        console.error("Error fetching enrollment date:", error);
      }
    };

    if (contract) {
      getLastEnrollmentDate();
    }
  }, [contract]);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file); // Convert file to base64
    reader.onload = () => {
      if (type === "governmentID") {
        setGovernmentIDBase64(reader.result);
        setFileStatus((prev) => ({ ...prev, governmentID: true }));
      } else {
        setMarksheetBase64(reader.result);
        setFileStatus((prev) => ({ ...prev, marksheet: true }));
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
  };

  const uploadToIPFS = async (base64Data, fileName) => {
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
    // Form validation
    if (!studentName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!governmentIDBase64 || !marksheetBase64) {
      alert("Please upload both required documents");
      return;
    }

    try {
      setLoading(true);

      // First upload the files to IPFS
      const governmentIDBase64ipfs = await uploadToIPFS(
        governmentIDBase64,
        "governmentID.pdf"
      );
      const marksheetBase64ipfs = await uploadToIPFS(
        marksheetBase64,
        "marksheet.pdf"
      );

      // Now enroll the student on-chain with the obtained CIDs
      const tx = await contract.enrollStudent(
        studentName,
        governmentIDBase64ipfs,
        marksheetBase64ipfs
      );
      await tx.wait();

      // Call the declare contract to enroll the student in the particular exam
      const examHash = await contract.examHash();
      const tx2 = await declareContract.enrollStudentToParticularExam(examHash);
      await tx2.wait();

      setLoading(false);
      navigate("/student");
    } catch (error) {
      setLoading(false);
      alert("Error enrolling: " + error.message);
      console.error("Error enrolling student:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {canEnroll ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-xl font-medium text-white flex items-center">
                <ClipboardCheck className="mr-2" size={24} />
                Student Enrollment
              </h2>
              <p className="mt-1 text-indigo-100 text-sm">
                <Clock className="inline mr-1" size={14} />
                Enrollment closes: {enrollmentDeadline}
              </p>
            </div>

            <div className="p-6">
              {/* Student Name Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Government ID Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Government ID Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, "governmentID")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1 text-center">
                    {fileStatus.governmentID ? (
                      <div className="flex flex-col items-center text-green-600">
                        <CheckCircle className="mx-auto h-10 w-10" />
                        <p className="text-sm mt-2">Document uploaded</p>
                      </div>
                    ) : (
                      <>
                        <FileText className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <p className="pl-1">
                            Upload a PDF or image of your ID
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, PNG, JPG up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Marksheet Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Marksheet
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, "marksheet")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1 text-center">
                    {fileStatus.marksheet ? (
                      <div className="flex flex-col items-center text-green-600">
                        <CheckCircle className="mx-auto h-10 w-10" />
                        <p className="text-sm mt-2">Document uploaded</p>
                      </div>
                    ) : (
                      <>
                        <Award className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <p className="pl-1">
                            Upload a PDF or image of your marksheet
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, PNG, JPG up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={enrollStudent}
                disabled={
                  loading ||
                  !studentName ||
                  !fileStatus.governmentID ||
                  !fileStatus.marksheet
                }
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  ${
                    loading ||
                    !studentName ||
                    !fileStatus.governmentID ||
                    !fileStatus.marksheet
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Processing
                  </>
                ) : (
                  <>
                    <Upload className="-ml-1 mr-2 h-5 w-5" />
                    Enroll in Exam
                  </>
                )}
              </button>

              <p className="mt-3 text-xs text-gray-500 text-center">
                By enrolling, you confirm that all uploaded documents are
                authentic and accurate.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-l-4 border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">
                    Enrollment Closed
                  </h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      The enrollment period for this exam has ended. Please
                      contact your course administrator for assistance.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        onClick={() => navigate("/")}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Return Home
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
