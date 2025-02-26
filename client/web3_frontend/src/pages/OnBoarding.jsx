import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Enrollment from "../contracts/Enrollment.json";
import { useAccount } from "wagmi";
import {
  User,
  UserCog,
  Home,
  Loader2,
  ChevronRight,
  UserCheck,
  AlertCircle,
} from "lucide-react";

const OnBoarding = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    rollno: "",
    specialization: "",
  });

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
      return;
    }

    const initializeContract = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contractInstance = new ethers.Contract(
          process.env.REACT_APP_ENROLLMENT_CONTRACT_ADDRESS,
          Enrollment.abi,
          signer
        );

        setContract(contractInstance);
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        setError(
          "Failed to connect to blockchain. Please check your connection and try again."
        );
      }
    };

    initializeContract();
  }, [isConnected, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const enrollAsStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.rollno) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    if (window.ethereum) {
      try {
        const tx = await contract.enrollStudent(
          formData.name,
          formData.age,
          formData.rollno
        );
        await tx.wait();
        setLoading(false);
        navigate("/");
      } catch (error) {
        console.error("Error enrolling student:", error);
        setError(error.reason || "Failed to enroll. Please try again later.");
        setLoading(false);
      }
    } else {
      setError(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
      setLoading(false);
    }
  };

  const enrollExaminer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.specialization) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    if (window.ethereum) {
      try {
        const tx = await contract.enrollExaminer(
          formData.name,
          formData.age,
          formData.specialization
        );
        await tx.wait();
        setLoading(false);
        navigate("/");
      } catch (error) {
        console.error("Error enrolling examiner:", error);
        setError(error.reason || "Failed to enroll. Please try again later.");
        setLoading(false);
      }
    } else {
      setError(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
      setLoading(false);
    }
  };

  const renderStudentForm = () => (
    <form onSubmit={enrollAsStudent} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label
          htmlFor="age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Age
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your age"
          min="1"
        />
      </div>

      <div>
        <label
          htmlFor="rollno"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Roll Number
        </label>
        <input
          type="text"
          id="rollno"
          name="rollno"
          value={formData.rollno}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your roll number"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enrolling...
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 mr-2" />
            Complete Enrollment
          </>
        )}
      </button>
    </form>
  );

  const renderExaminerForm = () => (
    <form onSubmit={enrollExaminer} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label
          htmlFor="age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Age
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your age"
          min="1"
        />
      </div>

      <div>
        <label
          htmlFor="specialization"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Specialization
        </label>
        <input
          type="text"
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your specialization (e.g., Mathematics, Physics)"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enrolling...
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 mr-2" />
            Complete Enrollment
          </>
        )}
      </button>
    </form>
  );

  const renderRoleSelection = () => (
    <div className="space-y-4">
      <p className="text-gray-600 text-center mb-6">
        Please select your role in the education system:
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => setSelectedRole("student")}
          className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <User className="w-10 h-10 text-blue-600 mb-3" />
          <span className="text-lg font-medium text-gray-800">Student</span>
          <span className="text-sm text-gray-500 mt-1">
            Enroll for courses and exams
          </span>
        </button>

        <button
          onClick={() => setSelectedRole("examiner")}
          className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <UserCog className="w-10 h-10 text-blue-600 mb-3" />
          <span className="text-lg font-medium text-gray-800">Examiner</span>
          <span className="text-sm text-gray-500 mt-1">
            Create and manage exams
          </span>
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Home className="w-4 h-4 mr-2" />
          Return to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-xl font-semibold text-white">
              Account Registration
            </h1>
            <p className="text-blue-100 text-sm">
              Complete your profile to access the platform
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!selectedRole ? renderRoleSelection() : null}
            {selectedRole === "student" ? renderStudentForm() : null}
            {selectedRole === "examiner" ? renderExaminerForm() : null}

            {selectedRole && (
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setError("");
                  setFormData({
                    name: "",
                    age: "",
                    rollno: "",
                    specialization: "",
                  });
                }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                Back to role selection
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Secured by blockchain technology • All enrollments are verified and
          stored on-chain
        </p>
      </div>
    </div>
  );
};

export default OnBoarding;
