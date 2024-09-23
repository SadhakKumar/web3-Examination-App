import React from 'react'
import { useNavigate } from 'react-router-dom';

const ExaminerHome = () => {
  const navigate = useNavigate();
  return (
    <>
      <div>ExaminerHome</div>
      <button onClick={() => navigate('/examiner/create')}>Create Exam</button>
    </>
    
  )
}

export default ExaminerHome