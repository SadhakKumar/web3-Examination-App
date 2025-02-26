import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Enrollment from "../contracts/Enrollment.json";
import { useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  Loader2,
  Wallet,
  ShieldCheck,
  ArrowRight,
  User,
  FileCheck,
  AlertTriangle,
} from "lucide-react";

function HomePage() {
  const [contract, setContract] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create a new contract instance with the signer
      const contractInstance = new ethers.Contract(
        process.env.REACT_APP_ENROLLMENT_CONTRACT_ADDRESS,
        Enrollment.abi,
        signer
      );
      setContract(contractInstance);
    }
  }, []);

  useEffect(() => {
    if (contract && isConnected) {
      getRole();
    }
  }, [contract, isConnected]);

  useEffect(() => {
    if (isConnected === false) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  const getRole = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
      console.error("Error getting role:", error);
      setError("Unable to verify your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="flex flex-col items-center space-y-4 pb-2">
          <div className="p-3 bg-blue-50 rounded-full">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Blockchain Authentication
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Connect your wallet to access the secure application
            </p>
          </div>
        </div>

        <div className="flex justify-center py-2">
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 text-blue-700">
              <Wallet className="w-5 h-5 mb-1" />
              <span className="text-xs">Connect</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-indigo-50 text-indigo-700">
              <ShieldCheck className="w-5 h-5 mb-1" />
              <span className="text-xs">Verify</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-purple-50 text-purple-700">
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">Access</span>
            </div>
          </div>
        </div>

        <div className="py-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 flex justify-center">
                <ConnectButton />
              </div>
              <p className="text-xs text-center text-gray-500 flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Secure and private authentication
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 mb-1 font-medium flex items-center">
                  <User className="w-3 h-3 mr-1" /> Connected Account
                </p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {address}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 rounded-md text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={getRole}
                disabled={isLoading}
                className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-70 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Continue to Application
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <FileCheck className="w-3 h-3 mr-1" />
            <span>Powered by Blockchain Technology</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
