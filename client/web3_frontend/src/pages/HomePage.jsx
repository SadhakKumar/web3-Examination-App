import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Enrollment from "../contracts/Enrollment.json";
import { useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import metaMaskImage from "./meta.png"; // Update the path to your image

function HomePage() {
  const [contract, setContract] = useState();
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contractInstance = new ethers.Contract(
      process.env.REACT_APP_ENROLLMENT_CONTRACT_ADDRESS,
      Enrollment.abi,
      signer
    );
    setContract(contractInstance);
  }, []);

  const getRole = async () => {
    try {
      const student = await contract.getStudent(address);
      if (student.name !== "") {
        navigate("/student");
        return;
      }
      const examiner = await contract.getExaminer(address);
      if (examiner.name !== "") {
        navigate("/examiner");
        return;
      }
      navigate("/onboarding");
    } catch (error) {
      console.log("Error getting role:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-customYellow3 p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8 flex flex-col items-center">
        <div className="mb-4">
          <img
            src={metaMaskImage}
            alt="Connect to MetaMask"
            className="w-50 h-50 object-cover rounded-full border-4 border-customYellow2"
          />
        </div>
        <h1 className="text-3xl font-bold text-center text-customYellow2 mb-4">
          Connect to MetaMask
        </h1>
        {!isConnected ? (
          <div className="flex justify-center mb-4">
            <ConnectButton />
          </div>
        ) : (
          <div>
            <p className="text-lg text-center mb-2">Connected Account:</p>
            <p className="font-semibold text-lg text-center mb-4">{address}</p>
            <button
              onClick={getRole}
              className="bg-customYellow2 hover:bg-customYellow2 text-white font-bold py-2 px-4 rounded w-full"
            >
              Check Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
