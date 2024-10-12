import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Enrollment from "../contracts/Enrollment.json";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const account = localStorage.getItem("account");
    if (account) {
      setAccount(account);
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contract = new ethers.Contract(
      "0x3E07df655bef52BBe69B9591AfeC13225e33D3e0",
      Enrollment.abi,
      signer
    );
    setContract(contract);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        localStorage.setItem("account", accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
    }
  };

  const getRole = async () => {
    try {
      const student = await contract.getStudent(account);
      if (student.name !== "") {
        navigate("/student");
        return;
      }
      const examiner = await contract.getExaminer(account);

      if (examiner.name !== "") {
        navigate("/examiner");
        return;
      }
      navigate("/onboarding");
    } catch (error) {
      console.log("Error getting role:", error);
    }
  };

  const enrollAsStudent = async () => {
    if (window.ethereum) {
      try {
        await contract.enrollStudent("vinesh", "20", "51");
        console.log("Enrollment successful!");
      } catch (error) {
        console.error("Error enrolling student:", error);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
    }
  };

  const enrollExaminer = async () => {
    if (window.ethereum) {
      try {
        await contract.enrollExaminer("vinesh", "20", "JEE");
        console.log("Enrollment successful!");
      } catch (error) {
        console.error("Error enrolling examiner:", error);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">
          Connect to MetaMask
        </h1>
        {!account ? (
          <button
            onClick={connectWallet}
            className="btn btn-primary w-full mb-4"
          >
            Connect
          </button>
        ) : (
          <div>
            <p className="text-lg">Connected Account:</p>
            <p className="font-semibold text-lg">{account}</p>
            <button onClick={getRole} className="btn btn-secondary w-full mb-4">
              Check Role
            </button>
            <div className="text-center">
              {contract && account && (
                <>
                  <p className="text-lg">
                    {getRole() === 1
                      ? "Role: Student"
                      : getRole() === 2
                      ? "Role: Examiner"
                      : ""}
                  </p>
                  {getRole() !== 1 && getRole() !== 2 && (
                    <button
                      onClick={enrollAsStudent}
                      className="btn btn-accent w-full"
                    >
                      Enroll as Student
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
