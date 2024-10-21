import React from "react";
import { useNavigate } from "react-router-dom";

const Card = ({ exam, key }) => {
  const navigate = useNavigate();
  const viewExam = () => {
    navigate("/examiner/exam/" + exam.examContractAddress);
  };
  return (
    <>
      <div className="card bg-base-100 w-96 shadow-xl" key={key}>
        <figure>
          <img
            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
            alt="Shoes"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{exam.examName}</h2>
          <p>{Date(exam.examDate)}</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={viewExam}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
