import React, { useEffect } from "react";
import answers from "../TestPaper/answers.json";
import questions from "../TestPaper/questions.json";
import { useState } from "react";
import { ethers } from "ethers";
import Exam from "../contracts/Exam.json";

const MCQ = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [examContract, setExamContract] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const ExamContract = new ethers.Contract(
      process.env.REACT_APP_EXAM_CONTRACT_ADDRESS,
      Exam.abi,
      signer
    );
    setExamContract(ExamContract);
  }, []);

  // Handle user selection
  const handleOptionChange = (questionId, selectedOption) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: selectedOption,
    });
    console.log(selectedAnswers);
  };

  // Submit and calculate the score
  const handleSubmit = async () => {
    console.log(selectedAnswers);
    let newScore = 0;

    // Loop through the answers to evaluate the score
    answers.answers.forEach(({ id, answer }) => {
      console.log(selectedAnswers[id - 1], answer);
      if (selectedAnswers[id - 1] === answer) {
        newScore += 1;
      }
    });

    setScore(newScore);
    await examContract.addScore(score);
    console.log(score);
  };

  useEffect(() => {
    console.log(questions);
  }, []);

  return (
    <div>
      <h1>MCQ Evaluation</h1>

      {/* {questions.question.map((q) => (
        <div key={q.id}>
          <h3>{q.question}</h3>
          {q.options.map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                name={`question-${q.id}`}
                value={option}
                onChange={() => handleOptionChange(q.id, option)}
              />
              {option}
            </label>
          ))}
        </div>
      ))} */}
      <div>
        {questions.question.map((question, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-500">
            <h3 className="text-xl font-semibold">{question.question}</h3>
            <ul className="mt-2">
              {question.options.map((option, optionIndex) => (
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
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit}>Submit</button>

      {score !== null && (
        <h2>
          Your Score: {score} / {questions.question.length}
        </h2>
      )}
    </div>
  );
};

export default MCQ;
