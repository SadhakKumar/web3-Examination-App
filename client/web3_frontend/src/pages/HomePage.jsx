import React, { useState, useEffect} from 'react';
import { ethers } from 'ethers';
// import fs from 'fs';
import Enrollment from '../contracts/Enrollment.json'; 
import { useNavigate } from 'react-router-dom';


function HomePage() {
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const [role, setRole] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const account = localStorage.getItem("account");
    if (account) {
      setAccount(account);
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
  
    // Create a new contract instance with the signer, allowing you to send transactions
    let contract = new ethers.Contract(
      "0xcd5077Fb89273f8Ec8d1F14a555f88baf60579E1",
      Enrollment.abi,
      signer
    );
    setContract(contract);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        localStorage.setItem("account", accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
  };

  const getRole = async() => {
    try {
      let student = await contract.getStudent(account);
      if(student.name != ''){
        navigate('/student');
        return;
      }
      let examiner = await contract.getExaminer(account);
  
      if(examiner.name != ''){  
        navigate('/examiner');
        return;
      }
      console.log(contract)
      navigate('/onboarding');
      return;
      
    } catch (error) {
      console.log('Error getting role:', error);
    }
   
  }


  const enrollAsStudent = async () => {
    if (window.ethereum) {
      try {
        await contract.enrollStudent('vinesh', '20', '51');
        console.log('Enrollment successful!');
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
        await contract.enrollExaminer('vinesh', '20', 'JEE');
        console.log('Enrollment successful!');
      } catch (error) {
        console.error('Error enrolling student:', error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
  }
  

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Connect to MetaMask</h1>
      {!account ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Connect
        </button>
      ) : (
        <div>
          <p>Connected Account:</p>
          <p style={{ fontWeight: 'bold' }}>{account}</p>
          { contract && account && getRole() == 1 ? (
            <p>Student</p>
          ) : contract && account && getRole() == 2 ? (
            <p>Examiner</p>
          ) : (
            <button onClick={enrollAsStudent} style={{ padding: '10px 20px', fontSize: '16px' }}>
              Enroll as Student
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
