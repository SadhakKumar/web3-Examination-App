import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Exam from "../contracts/Exam.json";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

const StudentExam = () => {
  const { id } = useParams();
  const { isConnected, address } = useAccount();
  const [contract, setContract] = useState();
  const [verified, setVerified] = useState(false);
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
    if (contract) {
      getExamDetails();
      isStudentVerified();
    }
  }, [contract]);
  return (
    <>
      <h1>status : {verified.toString()}</h1>
      <h1>Exam Details</h1>
      <h2>Exam Name : {exam.examName}</h2>
      <p>Start Time : {exam.startTime}</p>
      <p>Duration : {exam.duration}</p>
      <p>Last Enrollment Date : {exam.lastEnrollmentDate}</p>
    </>
  );
};

export default StudentExam;
