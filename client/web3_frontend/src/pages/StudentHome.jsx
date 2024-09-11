import React from 'react'
import { useNavigate } from 'react-router-dom';

const StudentHome = () => {

  const navigate = useNavigate();

  
  return (
    <>
      <div>Student Home</div>

      <button onClick={() => navigate('/exam')}>Start Exam</button>
    </>
  )
}

export default StudentHome