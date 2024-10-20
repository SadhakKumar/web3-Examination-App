import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studentImg from "./student.png";
import { useAccount } from "wagmi";

const StudentHome = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-6">
      <div className="bg-white shadow-lg rounded-lg flex w-full max-w-5xl">
        {/* Left Side - Image */}
        <div className="w-1/2 p-6 flex items-center justify-center bg-customYellow2 rounded-l-lg">
          <img
            src={studentImg}
            alt="Student"
            className="w-90 h-80 object-cover rounded-full shadow-md"
          />
        </div>

        {/* Right Side - Content */}
        <div className="w-1/2 p-8 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4 text-customYellow2 text-center">
            Welcome to Student Home
          </h1>
          <p className="text-lg text-gray-700 mb-6 text-center">
            Ready to start your exam?
          </p>
          <button
            onClick={() => navigate("/exam")}
            className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
          >
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
