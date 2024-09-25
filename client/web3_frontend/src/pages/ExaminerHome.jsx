import React from "react";
import { useNavigate } from "react-router-dom";

const ExaminerHome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Examiner Home</h1>
      <p className="mb-4 text-lg">Welcome to the Exam Management System!</p>
      <button
        onClick={() => navigate("/examiner/create")}
        className="btn btn-primary"
      >
        Create Exam
      </button>
    </div>
  );
};

export default ExaminerHome;
