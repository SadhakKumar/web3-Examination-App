import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import Exam from "../contracts/Exam.json";
import Papa from "papaparse";
import { AES } from "crypto-js";
import { pinata } from "../utils/config";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  Upload,
  CheckCircle,
  UserPlus,
  UserMinus,
  Loader,
  ExternalLink,
  Info,
  FileCheck,
  Award,
} from "lucide-react";

const ExaminerSideExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [contract, setContract] = useState(null);
  const [jsonResultQuestions, setJsonResultQuestions] = useState(null);
  const [jsonResultAnswers, setJsonResultAnswers] = useState(null);
  const [exam, setExam] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
  });
  const [isExamCreated, setIsExamCreated] = useState(false);
  const [verifier, setVerifier] = useState("");
  const [removeverifiers, setremoveVerifiers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState({
    questions: false,
    answers: false,
  });
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractInstance = new ethers.Contract(id, Exam.abi, signer);
    setContract(contractInstance);
  }, []);

  useEffect(() => {
    const getExamDetails = async () => {
      const name = await contract.name();
      const startTime = await contract.date();
      const durationBigNumber = await contract.duration();
      const duration = durationBigNumber.toNumber();
      const lastEnrollmentDate = await contract.lastEnrollmentDate();

      setExam({
        examName: name,
        startTime,
        duration,
        lastEnrollmentDate,
      });
    };

    const getStudentsDetails = async () => {
      const isExamCreated = await contract.isExamCreated();
      const students = await contract.getAllStudents();
      setStudents(students);
      setIsExamCreated(isExamCreated);
    };

    if (contract) {
      getExamDetails();
      getStudentsDetails();
    }
  }, [contract]);

  const addNewVerifier = async () => {
    if (verifier === "") {
      alert("Please enter verifier address");
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.addVerifier(verifier);
      await tx.wait();
      alert("Verifier added successfully");
      setVerifier("");
    } catch (error) {
      alert("Error adding verifier: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeVerifier = async () => {
    if (removeverifiers === "") {
      alert("Please enter verifier address");
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.removeVerifier(removeverifiers);
      await tx.wait();
      alert("Verifier removed successfully");
      setremoveVerifiers("");
    } catch (error) {
      alert("Error removing verifier: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e, value) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (value === "questions") {
            setJsonResultQuestions(result.data);
            setFileUploaded((prev) => ({ ...prev, questions: true }));
          } else {
            setJsonResultAnswers(result.data);
            setFileUploaded((prev) => ({ ...prev, answers: true }));
          }
        },
      });
    }
  };

  const handleSubmit = () => {
    if (!jsonResultQuestions || !jsonResultAnswers) {
      alert("Please upload both files");
      return;
    }
    setLoading(true);
    uploadToIPFS();
  };

  const uploadToIPFS = async () => {
    let questioncid = "";
    let answercid = "";
    try {
      const encryptedQuestions = AES.encrypt(
        JSON.stringify(jsonResultQuestions),
        process.env.REACT_APP_SECRET_KEY
      ).toString();
      const encryptedAnswers = AES.encrypt(
        JSON.stringify(jsonResultAnswers),
        process.env.REACT_APP_SECRET_KEY
      ).toString();

      const jsonQuestionBlob = new Blob([JSON.stringify(encryptedQuestions)], {
        type: "application/json",
      });
      const jsonAnswerBlob = new Blob([JSON.stringify(encryptedAnswers)], {
        type: "application/json",
      });

      const jsonFile = new File([jsonQuestionBlob], "examData.json");
      const jsonAnswerFile = new File([jsonAnswerBlob], "answerData.json");

      const uploadQuestionResult = await pinata.upload.file(jsonFile);
      questioncid = uploadQuestionResult.IpfsHash;
      const uploadAnswerResult = await pinata.upload.file(jsonAnswerFile);
      answercid = uploadAnswerResult.IpfsHash;

      const tx = await contract.createExam(questioncid, answercid);
      await tx.wait();
      setIsExamCreated(true);
      alert("Exam created successfully");
    } catch (error) {
      alert("Error uploading to IPFS: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyStudent = async (studentAddress) => {
    try {
      setLoading(true);
      const tx = await contract.verifyStudent(studentAddress);
      await tx.wait();

      // Update students list after verification
      const updatedStudents = await contract.getAllStudents();
      setStudents(updatedStudents);

      alert("Student verified successfully");
    } catch (error) {
      alert("Error verifying student: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        {/* Exam Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center">
            <Info className="mr-2 text-indigo-600" size={24} />
            Exam Management Dashboard
          </h1>

          {exam.examName ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-medium text-indigo-700 mb-4">
                  Exam Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Award className="mr-2 text-indigo-500" size={18} />
                    <span className="font-medium mr-2">Name:</span>
                    <span>{exam.examName}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Calendar className="mr-2 text-indigo-500" size={18} />
                    <span className="font-medium mr-2">Start Time:</span>
                    <span>{formatDate(exam.startTime)}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Clock className="mr-2 text-indigo-500" size={18} />
                    <span className="font-medium mr-2">Duration:</span>
                    <span>{exam.duration} minutes</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <AlertCircle className="mr-2 text-indigo-500" size={18} />
                    <span className="font-medium mr-2">Last Enrollment:</span>
                    <span>{formatDate(exam.lastEnrollmentDate)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-medium text-indigo-700 mb-4">
                  Status
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <CheckCircle
                      className={`mr-2 ${
                        isExamCreated ? "text-green-500" : "text-gray-400"
                      }`}
                      size={18}
                    />
                    <span className="font-medium">Exam Created:</span>
                    <span
                      className={`ml-2 ${
                        isExamCreated ? "text-green-500" : "text-gray-500"
                      }`}
                    >
                      {isExamCreated ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <CheckCircle
                      className={`mr-2 ${
                        students.length > 0 ? "text-green-500" : "text-gray-400"
                      }`}
                      size={18}
                    />
                    <span className="font-medium">Enrolled Students:</span>
                    <span className="ml-2">{students.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-6">
              <Loader className="animate-spin text-indigo-600" size={30} />
            </div>
          )}
        </div>

        {/* Pending Verification Students */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-medium text-indigo-700 border-b pb-3 mb-4 flex items-center">
            <FileCheck className="mr-2" size={20} />
            Student Verification Queue
          </h2>

          <div className="mt-4">
            {students.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {students
                  .filter((student) => !student.isVerified)
                  .map((student, index) => (
                    <div
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                      key={index}
                    >
                      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                        <h3 className="font-medium text-indigo-700">
                          {student.name}
                        </h3>
                      </div>

                      <div className="p-4">
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center text-gray-700">
                            <FileText
                              className="mr-2 text-indigo-500"
                              size={16}
                            />
                            <span className="font-medium mr-1">
                              ID Document:
                            </span>
                            <a
                              className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                              href={`https://copper-magnificent-kingfisher-423.mypinata.cloud/ipfs/${student.govermentDocument}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View <ExternalLink className="ml-1" size={14} />
                            </a>
                          </p>

                          <p className="flex items-center text-gray-700">
                            <FileText
                              className="mr-2 text-indigo-500"
                              size={16}
                            />
                            <span className="font-medium mr-1">Marksheet:</span>
                            <a
                              className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                              href={`https://copper-magnificent-kingfisher-423.mypinata.cloud/ipfs/${student.marksheet}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View <ExternalLink className="ml-1" size={14} />
                            </a>
                          </p>
                        </div>

                        <div className="mt-4">
                          <button
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium flex justify-center items-center transition-colors"
                            onClick={() =>
                              verifyStudent(student.studentAddress)
                            }
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : (
                              <CheckCircle className="mr-2" size={16} />
                            )}
                            Verify Student
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No pending student verifications
              </div>
            )}

            {students.length > 0 &&
              students.filter((s) => !s.isVerified).length === 0 && (
                <div className="text-center py-6 text-green-600 flex items-center justify-center">
                  <CheckCircle className="mr-2" size={20} />
                  All students have been verified
                </div>
              )}
          </div>
        </div>

        {/* Verifier Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-medium text-indigo-700 border-b pb-3 mb-4">
            Verifier Management
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-700 font-medium mb-3 flex items-center">
                <UserPlus className="mr-2 text-indigo-500" size={18} />
                Add New Verifier
              </h3>

              <div className="flex">
                <input
                  type="text"
                  value={verifier}
                  onChange={(e) => setVerifier(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-l-md outline-none"
                  placeholder="Enter verifier address"
                />
                <button
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md flex items-center transition-colors"
                  onClick={addNewVerifier}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <UserPlus size={16} className="mr-2" />
                  )}
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-gray-700 font-medium mb-3 flex items-center">
                <UserMinus className="mr-2 text-indigo-500" size={18} />
                Remove Verifier
              </h3>

              <div className="flex">
                <input
                  type="text"
                  value={removeverifiers}
                  onChange={(e) => setremoveVerifiers(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-l-md outline-none"
                  placeholder="Enter verifier address"
                />
                <button
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md flex items-center transition-colors"
                  onClick={removeVerifier}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <UserMinus size={16} className="mr-2" />
                  )}
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Creation */}
        {!isExamCreated ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium text-indigo-700 border-b pb-3 mb-4 flex items-center">
              <Upload className="mr-2" size={20} />
              Create Exam
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-700 font-medium mb-3">
                  Questions CSV
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, "questions")}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  {fileUploaded.questions ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="mr-2" size={20} />
                      <span>File uploaded successfully</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload className="mx-auto mb-2" size={24} />
                      <p>Click to upload questions CSV</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-gray-700 font-medium mb-3">Answers CSV</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, "answers")}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  {fileUploaded.answers ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="mr-2" size={20} />
                      <span>File uploaded successfully</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload className="mx-auto mb-2" size={24} />
                      <p>Click to upload answers CSV</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                loading || !fileUploaded.questions || !fileUploaded.answers
              }
              className={`mt-6 w-full py-3 rounded-md font-medium flex items-center justify-center transition-colors ${
                loading || !fileUploaded.questions || !fileUploaded.answers
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={20} />
                  Create Exam
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <CheckCircle size={36} />
            </div>
            <h2 className="text-xl font-medium text-gray-800">
              Exam has been successfully created and is ready for students
            </h2>
            <p className="text-gray-600 mt-2">
              All exam materials have been encrypted and stored securely on IPFS
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminerSideExam;
