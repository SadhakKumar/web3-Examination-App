import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Enrollment from "../contracts/Enrollment.json";
import { useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function HomePage() {
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const account = localStorage.getItem("account");
    if (account) {
      setAccount(account);
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contract = new ethers.Contract(
      process.env.REACT_APP_ENROLLMENT_CONTRACT_ADDRESS,
      Enrollment.abi,
      signer
    );
    setContract(contract);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">
          Connect to MetaMask
        </h1>
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <div>
            <p className="text-lg">Connected Account:</p>
            <p className="font-semibold text-lg">{address}</p>
            <button onClick={getRole} className="btn btn-secondary w-full mb-4">
              Check Role
            </button>
            <div className="text-center">
              {contract && address && (
                <>
                  <p className="text-lg">
                    {getRole() === 1
                      ? "Role: Student"
                      : getRole() === 2
                      ? "Role: Examiner"
                      : ""}
                  </p>
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
