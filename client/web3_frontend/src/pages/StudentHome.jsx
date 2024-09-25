import React from "react";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Student Home</h1>
        <p className="text-lg mb-6">Ready to start your exam?</p>
        <button
          onClick={() => navigate("/exam")}
          className="btn btn-primary w-full"
        >
          Start Exam
        </button>
      </div>
    </div>
  );
};

export default StudentHome;
