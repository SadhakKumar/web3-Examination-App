import React, { useState,useEffect } from 'react';
import { unixfs } from '@helia/unixfs'
import { json } from '@helia/json'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { AES, enc } from 'crypto-js';
import question from '../TestPaper/questions.json'
import {dagJson} from '@helia/dag-json'


const CreateExam = ({helia}) => {

    const navigate = useNavigate();


    const [contract, setContract] = useState();

    // useEffect(() => {
    //     const provider = new ethers.providers.Web3Provider(window.ethereum);
    //     const signer = provider.getSigner();
      
    //     // Create a new contract instance with the signer, allowing you to send transactions
    //     let contract = new ethers.Contract(
    //       "0xcd5077Fb89273f8Ec8d1F14a555f88baf60579E1",
    //       Enrollment.abi,
    //       signer
    //     );
    //     setContract(contract);
    // }, [])


  const [examDetails, setExamDetails] = useState({
    examName: '',
    startTime: '',
    duration: '',
  });

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
  });

  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleExamDetailChange = (e) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (index, e) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = e.target.value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const addQuestion = () => {
    setQuestions([...questions, currentQuestion]);
    setAnswers({ ...answers, [questions.length]: currentAnswer });
    setCurrentQuestion({ question: '', options: ['', '', '', ''] });
    setCurrentAnswer('');
  };

  const handleSubmit = () => {
    console.log('Exam Details: ', examDetails);
    console.log('Questions: ', questions);
    console.log('Answers: ', answers);

    UploadExam();
    // Logic to handle submitting the exam
  };

  const SECRET_KEY = '6c187bb65c1a4dbf9b3fc8b576a1c2dd';

  const updateSmartContract = async () => {
    console.log("yop")
    }
  const UploadExam = async () => {
    try {
        // const helia = await createHelia();
        const j = dagJson(helia);

        // Encrypt the questions and answers JSON using AES encryption
        // const encryptedQuestions = AES.encrypt(JSON.stringify(questions), SECRET_KEY).toString();
        // const encryptedAnswers = AES.encrypt(JSON.stringify(answers), SECRET_KEY).toString();

        // Add encrypted questions and answers to IPFS
        const myImmutableAddressForQuestions = await j.add(
          { "hello": "world121" }
        );
        console.log('Added encrypted questions to IPFS:', myImmutableAddressForQuestions.toString());

        const myImmutableAddressForAnswers = await j.add({ "hello": "world" });
        // console.log('Added encrypted answers to IPFS:', myImmutableAddressForAnswers.toString());


        // await helia.pins.add(myImmutableAddressForQuestions);
        // await helia.pins.add(myImmutableAddressForAnswers);

        // Retrieve CID
        const cid = CID.parse(myImmutableAddressForQuestions.toString());
        console.log(cid);

        // Get the data back from IPFS
        // let encryptedData = await j.get(cid);
        // console.log('Encrypted data:', encryptedData);

        // Decrypt the questions for testing purposes
        // let decryptedQuestions = AES.decrypt(encryptedData.encryptedQuestions, SECRET_KEY).toString(enc.Utf8);
        // console.log('Decrypted questions:', decryptedQuestions);

        // Stop Helia
        // helia.stop();

        // Update the smart contract or navigate
        // updateSmartContract();
        navigate('/examiner');

    } catch (error) {
        console.error('Error getting exam:', error);
    }
 
    
};
  return (
    <div>
      <h1>Create Exam</h1>

      {/* Exam Details Input */}
      <div>
        <label>
          Exam Name:
          <input type="text" name="examName" value={examDetails.examName} onChange={handleExamDetailChange} />
        </label>
        <label>
          Start Time:
          <input type="datetime-local" name="startTime" value={examDetails.startTime} onChange={handleExamDetailChange} />
        </label>
        <label>
          Duration (minutes):
          <input type="number" name="duration" value={examDetails.duration} onChange={handleExamDetailChange} />
        </label>
      </div>

      {/* <button onClick={addQuestion}>Next: Add Questions</button> */}

      {/* Question Input */}
      <div>
        <h2>Add Question</h2>
        <label>
          Question:
          <input type="text" name="question" value={currentQuestion.question} onChange={handleQuestionChange} />
        </label>

        {currentQuestion.options.map((option, index) => (
          <label key={index}>
            Option {index + 1}:
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e)}
            />
          </label>
        ))}

        <label>
          Answer:
          <input type="text" value={currentAnswer} onChange={handleAnswerChange} />
        </label>

        <button onClick={addQuestion}>Add Question</button>
      </div>

      <button onClick={handleSubmit}>Submit Exam</button>
    </div>
  );
};

export default CreateExam;
