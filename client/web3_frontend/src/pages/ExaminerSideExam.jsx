import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import Exam from "../contracts/Exam.json";
import Papa from "papaparse";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";

const ExaminerSideExam = () => {
  const { id } = useParams();

  const [contract, setContract] = useState();
  const [jsonResultQuestions, setJsonResultQuestions] = useState(null);
  const [jsonResultAnswers, setJsonResultAnswers] = useState(null);
  const [exam, setExam] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
    creationTime: "",
  });
  const [isExamCreated, setIsExamCreated] = useState(false);
  const [verifier, setVerifier] = useState("");
  const [removeverifiers, setremoveVerifiers] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create a new contract instance with the signer
    const contractInstance = new ethers.Contract(id, Exam.abi, signer);

    setContract(contractInstance);
  }, []);

  useEffect(() => {
    const getExamDetails = async () => {
      const examName = await contract.name();
      const startTime = await contract.date();
      const durationBigNumber = await contract.duration();
      const duration = durationBigNumber.toNumber();
      const lastEnrollmentDate = await contract.lastEnrollmentDate();
      const creationTimeBigNumber = await contract.creationTime();
      const creationTime = creationTimeBigNumber.toNumber();

      //   const isExamCreated = await contract.isExamCreated();
      //   setIsExamCreated(isExamCreated);

      const students = await contract.getAllStudents();
      setStudents(students);
      setExam({
        examName,
        startTime,
        duration,
        lastEnrollmentDate,
        creationTime,
      });
    };

    if (contract) {
      getExamDetails();
    }
  }, [contract]);

  const addNewVerifier = async () => {
    if (verifier === "") {
      alert("Please enter verifier address");
      return;
    }
    const tx = await contract.addVerifier(verifier);
    await tx.wait();
    alert("Verifier added successfully");
  };
  const removeVerifier = async () => {
    if (verifier === "") {
      alert("Please enter verifier address");
      return;
    }
    try {
      const tx = await contract.removeVerifier(removeverifiers);
      await tx.wait();
      alert("Verifier added successfully");
    } catch (error) {
      console.log("Error removing verifier: ", error);
    }
  };

  const handleFileUpload = (e, value) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (value === "questions") {
            setJsonResultQuestions(result.data);
          } else {
            setJsonResultAnswers(result.data);
          }
        },
      });
    }
  };

  const handleSubmit = () => {
    // Check if all fields are filled
    if (!jsonResultQuestions || !jsonResultAnswers) {
      alert("Please upload both files");
      return;
    }
    console.log("Questions: ", jsonResultQuestions);
    console.log("Answers: ", jsonResultAnswers);

    uploadToIPFS();
  };

  const uploadToIPFS = async () => {
    let questioncid = "";
    let answercid = "";
    let hash = "";
    try {
      const combinedString = JSON.stringify({
        jsonResultQuestions,
        jsonResultAnswers,
      });

      const encoder = new TextEncoder();
      const data = encoder.encode(combinedString);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      hash = hashHex;
      console.log("Hash:", hash);

      const encryptedQuestions = AES.encrypt(
        JSON.stringify(jsonResultQuestions),
        process.env.REACT_APP_SECRET_KEY
      ).toString();
      const encryptedAnswers = AES.encrypt(
        JSON.stringify(jsonResultAnswers),
        process.env.REACT_APP_SECRET_KEY
      ).toString();

      const jsonQuestionBlob = new Blob([JSON.stringify(encryptedQuestions)], {
        type: "application/json",
      });
      const jsonAnswerBlob = new Blob([JSON.stringify(encryptedAnswers)], {
        type: "application/json",
      });

      const jsonFile = new File([jsonQuestionBlob], "examData.json");
      const jsonAnswerFile = new File([jsonAnswerBlob], "answerData.json");

      const uploadQuestionResult = await pinata.upload.file(jsonFile);
      questioncid = uploadQuestionResult.IpfsHash;
      const uploadAnswerResult = await pinata.upload.file(jsonAnswerFile);
      answercid = uploadAnswerResult.IpfsHash;

      console.log(uploadQuestionResult.IpfsHash);
      console.log(uploadAnswerResult.IpfsHash);
    } catch (error) {
      alert("Error uploading to IPFS:", error);
      console.log("Error uploading to IPFS:", error);
    }

    try {
      const tx = await contract.createExam(questioncid, answercid);
      await tx.wait();
      setIsExamCreated(true);
      alert("Exam created successfully");
    } catch (error) {
      console.log("Error creating exam: ", error);
    }
  };

  const verifyStudent = async (studentAddress) => {
    try {
      const tx = await contract.verifyStudent(studentAddress);
      await tx.wait();
      alert("Student verified successfully");
    } catch (error) {
      console.log("Error verifying student: ", error);
    }
  };

  return (
    <>
      <div>
        {exam.examName !== "" ? (
          <div className="m-10">
            <h1>Name: {exam.examName}</h1>
            <p>Start Time: {exam.startTime}</p>
            <p>Duration: {exam.duration}</p>
            <p>Last Enrollment Date: {exam.lastEnrollmentDate}</p>
            <p>Creation Time: {exam.creationTime}</p>
          </div>
        ) : (
          <span className="loading loading-spinner loading-lg"></span>
        )}

        <div className="flex justify-center items-center flex-col">
          <h1>All Not Verified Students</h1>
          <div className="flex">
            {students.length > 0 ? (
              students
                .filter((student) => !student.isVerified)
                .map((student, index) => (
                  <div
                    className="card bg-base-100 w-96 shadow-xl m-10"
                    key={index}
                  >
                    <div className="card-body">
                      <h2 className="card-title">{student.name}</h2>
                      <p>
                        govermentDocument:{" "}
                        <a
                          className="link link-primary"
                          href={`https://copper-magnificent-kingfisher-423.mypinata.cloud/ipfs/${student.govermentDocument}`}
                        >
                          link
                        </a>
                      </p>
                      <p>
                        marksheet:{" "}
                        <a
                          className="link link-primary"
                          href={`https://copper-magnificent-kingfisher-423.mypinata.cloud/ipfs/${student.marksheet}`}
                        >
                          link
                        </a>
                      </p>
                      <p>is verified? : {student.isVerified.toString()}</p>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-primary"
                          onClick={() => verifyStudent(student.studentAddress)}
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <h1>No Student Enrollments</h1>
            )}
          </div>
        </div>

        <h1 className="text-2xl mt-10">Add new Verifiers</h1>
        <div>
          <input
            type="text"
            name="verifier"
            value={verifier}
            onChange={(e) => setVerifier(e.target.value)}
            className="input input-bordered mt-2 p-3 border-gray-300 rounded-lg "
          />
          <button
            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
            onClick={addNewVerifier}
          >
            Add Verifier
          </button>
        </div>

        <h1 className="text-2xl mt-10">remove Verifiers</h1>
        <div>
          <input
            type="text"
            name="verifier"
            value={removeverifiers}
            onChange={(e) => setremoveVerifiers(e.target.value)}
            className="input input-bordered mt-2 p-3 border-gray-300 rounded-lg "
          />
          <button
            className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
            onClick={removeVerifier}
          >
            Add Verifier
          </button>
        </div>

        {!isExamCreated ? (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4 text-gray-700">
              Upload CSV Files
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-600 mb-2">Questions CSV</h3>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, "questions")}
                  className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
                />
                {jsonResultQuestions && (
                  <pre className="bg-gray-100 p-4 mt-4 rounded-lg text-sm">
                    {JSON.stringify(jsonResultQuestions, null, 2)}
                  </pre>
                )}
              </div>
              <div>
                <h3 className="text-gray-600 mb-2">Answers CSV</h3>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, "answers")}
                  className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
                />
                {jsonResultAnswers && (
                  <pre className="bg-gray-100 p-4 mt-4 rounded-lg text-sm">
                    {JSON.stringify(jsonResultAnswers, null, 2)}
                  </pre>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-customYellow2 text-white font-bold py-3 px-6 rounded-lg shadow-md w-full hover:bg-customYellow transition-transform transform hover:scale-105"
            >
              Submit Exam
            </button>
          </div>
        ) : (
          <h1>Exam is created</h1>
        )}
      </div>
    </>
  );
};

export default ExaminerSideExam;
