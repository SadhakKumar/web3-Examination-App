import React from "react";
import Papa from "papaparse";
import { useState } from "react";
import { AES, enc } from "crypto-js";
import { pinata } from "../utils/config";

export default function StudentEnrollment() {
  const [governmentDocuments, setGovernmentDocuments] = useState(null);
  const [examMarksheet, setexamMarksheet] = useState(null);
  const [base64, setBase64] = useState("");

  const handleFileUpload = (e, value) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (value === "govDocument") {
            setGovernmentDocuments(result.data);
          } else {
            setexamMarksheet(result.data);
          }
        },
      });
    }
  };

  // const SECRET_KEY = "6c187bb65c1a4dbf9b3fc8b576a1c2dd";

  const uploadToIPFS = async () => {
    try {
      const reader = new FileReader();

      reader.readAsDataURL(governmentDocuments); // Read file as base64

      reader.onload = () => {
        const base64String = reader.result; // This is the Base64 string
        setBase64(base64String);
        console.log(base64String); // You can see the Base64-encoded PDF in the console
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };

      // const encryptedQuestions = AES.encrypt(
      //   JSON.stringify(jsonResultQuestions),
      //   SECRET_KEY
      // ).toString();
      // const encryptedAnswers = AES.encrypt(
      //   JSON.stringify(jsonResultAnswers),
      //   SECRET_KEY
      // ).toString();

      // const questionsCid = await ipfs.add(encryptedQuestions)
      // const answersCid = await ipfs.add(encryptedAnswers)
      const governmentDocumentsResult = await pinata.upload.base64(base64);
      const governmentDocumentsCID = governmentDocumentsResult.IpfsHash;
      const examMarksheetResult = await pinata.upload.base64(
        "SGVsbG8gV29ybGQh"
      );
      const examMarksheetResultCID = governmentDocumentsResult.IpfsHash;



      console.log(governmentDocumentsCID);
     } catch (error) {
      alert("Error uploading to IPFS:", error);
      console.log("Error uploading to IPFS:", error);
    }

    // try {
    //   await examinerContract.createExam(
    //     hash,
    //     questioncid,
    //     answercid,
    //     examDetails.startTime,
    //     examDetails.startTime,
    //     examDetails.duration,
    //     examDetails.examName
    //   );
    //   console.log("Exam created successfully!");

    //   await examEnrollmentContract.createExam(hash);
    // } catch (error) {
    //   alert("Error creating exam:", error);
    //   console.error("Error creating exam:", error);
    // }

    // navigate("/examiner");
  };

  return (
    <div>
      <div>
        <h3 className="text-gray-600 mb-2">Answers CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e, "answers")}
          className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
        />
        {/* {governmentDocuments && (
          <pre className="bg-gray-100 p-4 mt-4 rounded-lg text-sm">
            {JSON.stringify(governmentDocuments, null, 2)}
          </pre>
        )} */}
        <h3 className="text-gray-600 mb-2 mt-4">Government Document</h3>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, "govDocument")}
          className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
        />

        <h3 className="text-gray-600 mb-2 mt-4">Marksheet (Image or PDF)</h3>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, "marksheet")}
          className="input input-bordered w-full p-3 border-gray-300 rounded-lg"
        />
      </div>
      <button onClick={uploadToIPFS}>upload</button>
    </div>
  );
}
