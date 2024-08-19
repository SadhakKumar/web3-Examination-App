import React,{useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers';
import Enrollment from '../contracts/Enrollment.json';

const OnBoarding = () => {

    const navigate = useNavigate();
    const [contract, setContract] = useState();
   
    useEffect(() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
      
        // Create a new contract instance with the signer, allowing you to send transactions
        let contract = new ethers.Contract(
          "0xcd5077Fb89273f8Ec8d1F14a555f88baf60579E1",
          Enrollment.abi,
          signer
        );
        setContract(contract);
    }, [])

    const enrollAsStudent = async () => {
        if (window.ethereum) {
          try {
            await contract.enrollStudent('sadiya', '20', '51');
            console.log('Enrollment successful!');
            navigate('/');
          } catch (error) {
            console.error('Error enrolling student:', error);
          }
        } else {
          alert("MetaMask is not installed. Please install MetaMask and try again.");
        }
      };

      const enrollExaminer = async () => {
        if (window.ethereum) {
          try {
            await contract.enrollExaminer('vineah', '20', 'JEE');
            console.log('Enrollment successful!');
            navigate('/');
          } catch (error) {
            console.error('Error enrolling student:', error);
          }
        } else {
          alert("MetaMask is not installed. Please install MetaMask and try again.");
        }
      }
  return (
    <>
        <h1>OnBoarding</h1>
        <button onClick={enrollAsStudent}>Enroll as a student</button>
        <button onClick={enrollExaminer}>Enroll as an examiner</button>
    </>
  )
}

export default OnBoarding