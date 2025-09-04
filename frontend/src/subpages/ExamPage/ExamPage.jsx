import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExamPage.css";

// Sample Question Paper (Ye backend se fetch hoga in Step 3)
const questions = [
  {
    id: 1,
    questionText: "What is the capital of India?",
    options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
  },
  {
    id: 2,
    questionText: "Who is the current CEO of Tesla?",
    options: ["Jeff Bezos", "Elon Musk", "Sundar Pichai", "Bill Gates"],
  },
  {
    id: 3,
    questionText: "What is the national animal of India?",
    options: ["Tiger", "Lion", "Elephant", "Leopard"],
  },
];

const ExamPage = () => {
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  // Jab user answer select karega, state update hoga
  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  // Submit button click hone par result page pe navigate karega
  const handleSubmit = () => {
    navigate("/exam/result", { state: { answers } });
  };

  return (
    <div className="exam-container">
      <h1>Mock Test - IIM Predictor</h1>

      {/* Saare questions ek saath show honge */}
      {questions.map((question) => (
        <div key={question.id} className="question-block">
          <h3>{question.questionText}</h3>
          {question.options.map((option, index) => (
            <label key={index} className="option-label">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={answers[question.id] === option}
                onChange={() => handleOptionChange(question.id, option)}
              />
              {option}
            </label>
          ))}
        </div>
      ))}

      {/* Submit Button */}
      <button className="submit-btn" onClick={handleSubmit}>
        Submit Test
      </button>
    </div>
  );
};

export default ExamPage;
