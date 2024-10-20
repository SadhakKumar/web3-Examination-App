import React, { useState, useEffect } from "react";

const Declare = () => {
  const [examDetails, setExamDetails] = useState({
    examName: "",
    startTime: "",
    duration: "",
    lastEnrollmentDate: "",
    enrollmentDuration: "",
    examHash: "",
  });

  const handleExamDetailChange = (e) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="mb-6 space-y-4 m-10">
        {/* Exam Name */}
        <label className="block text-lg text-gray-700 font-semibold">
          Exam Name:
          <input
            type="text"
            name="examName"
            value={examDetails.examName}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Start Time */}
        <label className="block text-lg text-gray-700 font-semibold">
          Start Time:
          <input
            type="datetime-local"
            name="startTime"
            value={examDetails.startTime}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Duration (minutes) */}
        <label className="block text-lg text-gray-700 font-semibold">
          Duration (minutes):
          <input
            type="number"
            name="duration"
            value={examDetails.duration}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Last Enrollment Date */}
        <label className="block text-lg text-gray-700 font-semibold">
          Last Enrollment Date:
          <input
            type="datetime-local"
            name="lastEnrollmentDate"
            value={examDetails.lastEnrollmentDate}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Enrollment Duration */}
        <label className="block text-lg text-gray-700 font-semibold">
          Enrollment Duration (minutes):
          <input
            type="number"
            name="enrollmentDuration"
            value={examDetails.enrollmentDuration}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>

        {/* Exam Hash */}
        <label className="block text-lg text-gray-700 font-semibold">
          Enrollment Duration(days):
          <input
            type="number"
            name="examHash"
            value={examDetails.examHash}
            onChange={handleExamDetailChange}
            className="input input-bordered w-full mt-2 p-3 border-gray-300 rounded-lg"
          />
        </label>
      </div>
    </>
  );
};

export default Declare;
