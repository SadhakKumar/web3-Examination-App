import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";
import Exam from "../contracts/Exam.json";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

const Test = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [examCID, setExamCID] = useState("");
  const [testPaper, setTestPaper] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
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
    const getExams = async () => {
      try {
        const examscid = await contract.getExamCID();
        console.log("CID", examscid);

        setExamCID(examscid);
      } catch (error) {
        console.log("Error getting exams:", error);
      }
    };

    if (contract) {
      getExams();
    }
  }, [contract]);

  useEffect(() => {
    const getExamFromIPFS = async () => {
      setLoading(true);
      try {
        const encryptedData = await pinata.gateways.get(examCID);

        const data = encryptedData.data.replace(/^"|"$/g, "");
        const decryptedBytes = AES.decrypt(
          data,
          process.env.REACT_APP_SECRET_KEY
        );
        const decryptedQuestions = decryptedBytes.toString(enc.Utf8);
        console.log(JSON.parse(decryptedQuestions));
        setTestPaper(JSON.parse(decryptedQuestions));
      } catch (error) {
        console.log("Error getting from IPFS:", error);
      } finally {
        setLoading(false);
      }
    };

    if (examCID) {
      getExamFromIPFS();
    }
  }, [examCID]);
  // Handle user selection
  const handleOptionChange = (questionId, selectedOption) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: selectedOption,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const answersCid = await contract.getAnswersCID();
    console.log("answersCid", answersCid);

    try {
      const encryptedData = await pinata.gateways.get(answersCid);

      const data = encryptedData.data.replace(/^"|"$/g, "");
      const decryptedBytes = AES.decrypt(
        data,
        process.env.REACT_APP_SECRET_KEY
      );
      const decryptedQuestions = decryptedBytes.toString(enc.Utf8);

      const answers = JSON.parse(decryptedQuestions);

      // Now, evaluate the student's answers
      let score = 0;
      answers.forEach((answer, index) => {
        const studentAnswer = selectedAnswers[index];
        if (answer.answer === studentAnswer) {
          score += 1; // 1 point for each correct answer
        }
      });
      setScore(score);

      const tx = await contract.gradeStudent(score);
      await tx.wait();

      console.log("Final score:", score);
      alert(`Your final score is: ${score}/${answers.length}`);
      setLoading(false);
      navigate("/student");
    } catch (error) {
      console.log("Error getting from IPFS:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {loading ? (
        <span className="loading loading-lg"></span>
      ) : (
        <div>
          {testPaper.map((question, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold">{question.question}</h3>
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
                          onChange={() => handleOptionChange(index, option)}
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}

          <button className="btn btn-primary" onClick={handleSubmit}>
            {loading ? <span className="loading loading-lg"></span> : "Submit"}
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Test;
