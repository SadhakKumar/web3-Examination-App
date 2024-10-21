import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ExamEnrollment from "../contracts/ExamEnrollment.json";
import Examiner from "../contracts/Examiner.json";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";

const Test = () => {
  const [contract, setContract] = useState(null);
  const [examinerContract, setExaminerContract] = useState(null);
  const [exam, setExam] = useState(null);
  const [enrolled, setEnrolled] = useState(true);
  const [testPaper, setTestPaper] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractInstance = new ethers.Contract(
      process.env.REACT_APP_EXAM_ENROLLMENT_CONTRACT_ADDRESS,
      ExamEnrollment.abi,
      signer
    );
    setContract(contractInstance);

    const examinerContractInstance = new ethers.Contract(
      process.env.REACT_APP_EXAMINER_CONTRACT_ADDRESS,
      Examiner.abi,
      signer
    );
    setExaminerContract(examinerContractInstance);
  }, []);

  useEffect(() => {
    const getExams = async () => {
      if (!examinerContract) return;
      try {
        const exams = await examinerContract.getExam(id);

        setExam(exams);
      } catch (error) {
        console.log("Error getting exams:", error);
      }
    };

    getExams();
  }, [examinerContract, id]);

  // useEffect(() => {
  //   const check = async () => {
  //     if (!contract) {
  //       console.log("Contract is not initialized yet.");
  //       return;
  //     }

  //     try {
  //       const enrolledStatus = await contract.checkEnrollment(id);
  //       if (enrolledStatus) {
  //         setEnrolled(true);
  //       }
  //     } catch (error) {
  //       console.error("Error checking enrollment:", error);
  //     }
  //   };

  //   check();
  // }, [contract, id]);

  const enroll = async () => {
    try {
      const transaction = await contract.enroll(id);
      await transaction.wait();
      console.log("Enrollment successful!");
      setEnrolled(true);
    } catch (error) {
      console.error("Error enrolling student:", error);
    }
  };

  const SECRET_KEY = "6c187bb65c1a4dbf9b3fc8b576a1c2dd";
  const getFromIPFS = async () => {
    setLoading(true);
    try {
      if (!exam) return;
      const encryptedData = await pinata.gateways.get(exam.questions);
 
      const data = encryptedData.data.replace(/^"|"$/g, "");
      const decryptedBytes = AES.decrypt(data, SECRET_KEY);
      const decryptedQuestions = decryptedBytes.toString(enc.Utf8);
      console.log(JSON.parse(decryptedQuestions));
      setTestPaper(JSON.parse(decryptedQuestions));
    } catch (error) {
      console.log("Error getting from IPFS:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    getFromIPFS();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {!enrolled ? (
        <button onClick={enroll} className="btn btn-primary">
          Enroll
        </button>
      ) : (
        exam && (
          <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
            {new Date() < new Date(exam.start_time) ? (
              <p className="text-lg font-medium text-gray-600">Yet to start</p>
            ) : (
              <div>
                <button
                  onClick={handleStartExam}
                  className="btn btn-secondary mb-4"
                >
                  Start Exam
                </button>
                {loading && !testPaper ? (
                  <p className="text-lg">Loading test paper...</p>
                ) : (
                  <div>
                    {testPaper.map((question, index) => (
                      <div
                        key={index}
                        className="mb-4 p-4 border rounded-lg bg-gray-50"
                      >
                        <h3 className="text-xl font-semibold">
                          {question.question}
                        </h3>
                        <ul className="mt-2">
                          {JSON.parse(question.options.replace(/'/g, '"')).map(
                            (option, optionIndex) => (
                              <li key={optionIndex} className="mt-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`question-${index}`} // Group radio buttons by question
                                    value={option}
                                    className="form-radio text-blue-600 h-5 w-5"
                                  />
                                  <span className="ml-2">{option}</span>
                                </label>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Test;
