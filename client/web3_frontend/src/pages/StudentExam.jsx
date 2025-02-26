import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Exam from "../contracts/Exam.json";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { AES, enc } from "crypto-js";
import { Clock, Calendar, Award, AlertTriangle } from "lucide-react";

const StudentExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isConnected, address } = useAccount();
  const [contract, setContract] = useState();
  const [verified, setVerified] = useState(false);
  const [startExam, setStartExam] = useState(false);
  const [student, setStudent] = useState();
  const [exam, setExam] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
  });

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractInstance = new ethers.Contract(id, Exam.abi, signer);
    setContract(contractInstance);
  }, []);

  useEffect(() => {
    if (exam.startTime && exam.duration) {
      const startTime = new Date(exam.startTime);
      const durationInMinutes = exam.duration;
      const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);
      const currentTime = new Date();

      if (currentTime >= startTime && currentTime <= endTime) {
        setStartExam(true);
      } else {
        setStartExam(false);
      }
    }
  }, [exam]);

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

    const isStudentVerified = async () => {
      const isVerified = await contract.isStudentVerified(address);
      setVerified(isVerified);
    };

    const getStudentDetails = async () => {
      const student = await contract.getStudent();
      setStudent(student);
    };
    if (contract) {
      getExamDetails();
      isStudentVerified();
      getStudentDetails();
    }
  }, [contract]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-8 my-8 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold text-center mb-2">
            {exam.examName}
          </h1>
          <div className="h-1 w-32 bg-customYellow2 rounded-full mx-auto mb-6"></div>

          <div className="flex items-center justify-center mb-6">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                verified ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span
              className={`text-sm font-medium ${
                verified ? "text-green-700" : "text-red-700"
              }`}
            >
              {verified ? "Verified Student" : "Not Verified"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800 text-center">
                  Exam Information
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Start Date
                      </p>
                      <p className="text-gray-800">
                        {formatDate(exam.startTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Duration
                      </p>
                      <p className="text-gray-800">{exam.duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Enrollment Deadline
                      </p>
                      <p className="text-gray-800">
                        {formatDate(exam.lastEnrollmentDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800 text-center">
                  Status
                </h2>
              </div>
              <div className="p-4 flex flex-col justify-between h-full">
                {student && student.hasExamGiven ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-green-700 font-medium">
                          Exam Completed
                        </p>
                        <p className="text-sm text-gray-500">
                          Exam has been successfully submitted
                        </p>
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Your Score
                      </p>
                      <p className="text-4xl font-bold text-gray-800">
                        {AES.decrypt(
                          student.encryptedMarks,
                          process.env.REACT_APP_SECRET_KEY
                        ).toString(enc.Utf8)}
                      </p>
                    </div>
                  </div>
                ) : verified ? (
                  <div>
                    {startExam ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Clock className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-blue-700 font-medium">
                              Exam in Progress
                            </p>
                            <p className="text-sm text-gray-500">
                              The exam is currently active
                            </p>
                          </div>
                        </div>
                        <button
                          className="w-full mt-6 py-3 px-4 bg-customYellow2 hover:bg-yellow-500 text-white font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          onClick={() => navigate(`/exam/${id}`)}
                        >
                          Start Exam
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">
                            Waiting for Exam
                          </p>
                          <p className="text-sm text-gray-500">
                            Scheduled for {formatDate(exam.startTime)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-700 font-medium">Not Verified</p>
                      <p className="text-sm text-gray-500">
                        You are not verified to take this exam
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2 text-center">
              Preparation Tips
            </h3>
            <p className="text-gray-700 text-sm text-center">
              Prepare for this exam by reviewing the syllabus and completing
              practice tests. Make sure to check all verification requirements
              before the exam date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExam;
