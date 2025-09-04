import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResultPage.css";

// Sample Question Data (Backend se fetch hoga Step 3 me)
const questions = [
  { id: 1, questionText: "What is the capital of India?", correctAnswer: "Delhi" },
  { id: 2, questionText: "Who is the current CEO of Tesla?", correctAnswer: "Elon Musk" },
  { id: 3, questionText: "What is the national animal of India?", correctAnswer: "Tiger" },
];

// Sample Topper Data (Backend se fetch hoga Step 3 me)
const topperScore = 3; // Example: Topper ke full marks

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers || {};

  // Score Calculation Function
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const userScore = calculateScore();
  const percentile = ((userScore / questions.length) * 100).toFixed(2); // Temporary Percentile Calculation

  return (
    <div className="result-container">
      <h1>Your Exam Results</h1>
      <h2>Your Score: {userScore} / {questions.length}</h2>
      <h3>Your Predicted Percentile: {percentile}%</h3>
      <h3>Topper’s Score: {topperScore} / {questions.length}</h3>

      <button className="home-btn" onClick={() => navigate("/")}>Go Home</button>
    </div>
  );
};

export default ResultPage;
