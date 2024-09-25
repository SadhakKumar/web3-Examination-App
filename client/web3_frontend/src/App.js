import React, { useEffect, useState } from "react";
import "./App.css";
import HomePage from "./pages/HomePage";
import StudentHome from "./pages/StudentHome";
import ExaminerHome from "./pages/ExaminerHome";
import CreateExam from "./pages/CreateExam";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OnBoarding from "./pages/OnBoarding";
import Exam from "./pages/Exam";
import { Outlet } from "react-router-dom";
import Test from "./pages/Test";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/examiner" element={<Outlet />}>
          <Route path="/examiner" element={<ExaminerHome />} />
          <Route path="/examiner/create" element={<CreateExam />} />
        </Route>
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/exam/:id" element={<Test />} />
      </Routes>
    </div>
  );
}

export default App;
