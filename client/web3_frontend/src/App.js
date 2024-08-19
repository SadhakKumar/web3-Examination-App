
import './App.css';
import HomePage from './pages/HomePage';
import StudentHome from './pages/StudentHome';
import ExaminerHome from './pages/ExaminerHome';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OnBoarding from './pages/OnBoarding';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element = {<HomePage/>} />
        <Route path="/student" element = {<StudentHome/>} />
        <Route path="/examiner" element = {<ExaminerHome/>} />
        <Route path='/onboarding' element = {<OnBoarding/>} />
      </Routes>
    </div>
  );
}

export default App;
