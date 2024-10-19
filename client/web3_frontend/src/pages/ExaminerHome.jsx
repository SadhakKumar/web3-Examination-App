import React from "react";
import { useNavigate } from "react-router-dom";
import professorImage from "./assistant-professor.png";

const ExaminerHome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-customYellow3 p-6">
      <div className="bg-white shadow-lg rounded-lg flex w-full max-w-5xl">
        {/* Left Side - Image */}
        <div className="w-1/2 p-6 flex items-center justify-center bg-customYellow2 rounded-l-lg">
          <img
            src={professorImage}
            alt="Professor"
            className="w-90 h-80 object-cover rounded-full shadow-md"
          />
        </div>

        {/* Right Side - Content */}
        <div className="w-1/2 p-8 flex flex-col items-center justify-center">
          <h1 className="text-4xl mb-4 font-extrabold text-customYellow2 text-center">
            Examiner Home
          </h1>
          <p className="text-xl text-gray-600 mb-6 text-center">
            Welcome to the Exam Management System!
          </p>
          <button
            onClick={() => navigate("/examiner/create")}
            className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
          >
            Create Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExaminerHome;
