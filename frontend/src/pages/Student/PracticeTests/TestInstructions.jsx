import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaClock, FaQuestionCircle, FaPlay, FaArrowLeft } from "react-icons/fa";
import "./TestInstructions.css";

const TestInstructions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreementChecked, setAgreementChecked] = useState(false);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/practice-tests/student/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTest(data.practiceTest);
        
        // If already completed, redirect to results
        if (data.isCompleted) {
          navigate(`/student/practice-tests/${testId}/result`);
          return;
        }
        
        // If already attempted but not completed, show option to continue
        if (data.hasAttempted) {
          const continueTest = window.confirm('You have already started this test. Do you want to continue from where you left off?');
          if (continueTest) {
            navigate(`/student/practice-tests/${testId}/test`);
            return;
          }
        }
      } else {
        console.error('Failed to fetch test details');
        navigate('/student/practice-tests');
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
      navigate('/student/practice-tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!agreementChecked) {
      alert('Please read and agree to the test instructions before starting.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/practice-tests/student/${testId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        navigate(`/student/practice-tests/${testId}/test`);
      } else {
        alert('Failed to start test. Please try again.');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} hour ${mins} minutes` : `${mins} minutes`;
  };

  if (loading) {
    return (
      <div className="instructions-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading test instructions...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="instructions-container">
        <div className="error-message">
          <h2>Test not found</h2>
          <p>The requested test could not be found or you don't have access to it.</p>
          <button onClick={() => navigate('/student/practice-tests')}>
            Back to Practice Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="instructions-container">
      <div className="instructions-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/student/practice-tests')}
        >
          <FaArrowLeft /> Back to Tests
        </button>
        <h1>{test.title}</h1>
      </div>

      <div className="instructions-content">
        <div className="test-overview">
          <h2>Test Overview</h2>
          <div className="overview-grid">
            <div className="overview-item">
              <FaClock className="overview-icon" />
              <div>
                <span className="overview-label">Duration</span>
                <span className="overview-value">{formatDuration(test.duration)}</span>
              </div>
            </div>
            <div className="overview-item">
              <FaQuestionCircle className="overview-icon" />
              <div>
                <span className="overview-label">Total Questions</span>
                <span className="overview-value">{test.totalQuestions}</span>
              </div>
            </div>
            <div className="overview-item">
              <span className="marks-icon">📊</span>
              <div>
                <span className="overview-label">Total Marks</span>
                <span className="overview-value">{test.totalMarks}</span>
              </div>
            </div>
            <div className="overview-item">
              <span className="type-icon">📋</span>
              <div>
                <span className="overview-label">Test Type</span>
                <span className="overview-value">{test.testType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sections-overview">
          <h2>Sections</h2>
          <div className="sections-grid">
            {test.sections.map((section, index) => (
              <div key={index} className="section-card">
                <h3>{section.name}</h3>
                <div className="section-details">
                  <span>Duration: {formatDuration(section.duration)}</span>
                  <span>Questions: {section.totalQuestions}</span>
                  <span>Marks: {section.totalMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="test-instructions">
          <h2>Instructions</h2>
          {test.instructions ? (
            <div 
              className="instructions-text"
              dangerouslySetInnerHTML={{ __html: test.instructions }}
            />
          ) : (
            <div className="default-instructions">
              <h3>General Instructions:</h3>
              <ul>
                <li>This is a timed test. The timer will start as soon as you begin.</li>
                <li>You can navigate between questions within a section using the question palette.</li>
                <li>Each section has a separate time limit. You cannot go back to a previous section once the time is over.</li>
                <li>You can mark questions for review and revisit them later within the same section.</li>
                <li>There is negative marking for wrong answers: +3 marks for correct answers, -1 mark for wrong answers.</li>
                <li>Unanswered questions will not be considered for evaluation.</li>
                <li>Make sure you have a stable internet connection throughout the test.</li>
                <li>Do not refresh or close the browser window during the test.</li>
                <li>Submit the test before the time expires to ensure your answers are saved.</li>
                <li>Once submitted, you cannot change your answers.</li>
              </ul>

              <h3>Navigation Instructions:</h3>
              <ul>
                <li><strong>Answered:</strong> Questions you have answered will be marked in green.</li>
                <li><strong>Not Answered:</strong> Questions you haven't answered will be marked in red.</li>
                <li><strong>Marked for Review:</strong> Questions marked for review will be marked in yellow.</li>
                <li><strong>Answered & Marked for Review:</strong> Questions answered and marked for review will be marked in purple.</li>
              </ul>

              <h3>System Requirements:</h3>
              <ul>
                <li>A stable internet connection</li>
                <li>Updated web browser (Chrome, Firefox, Safari, or Edge)</li>
                <li>JavaScript must be enabled</li>
                <li>Screen resolution of at least 1024x768</li>
              </ul>

              <div className="important-note">
                <strong>Important:</strong> Ensure you are in a quiet environment with minimal distractions. 
                This test simulates actual CAT exam conditions.
              </div>
            </div>
          )}
        </div>

        <div className="agreement-section">
          <label className="agreement-checkbox">
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
            />
            <span className="checkmark"></span>
            I have read and understood all the instructions above. I agree to follow the test guidelines and understand that any violation may result in disqualification.
          </label>
        </div>

        <div className="start-test-section">
          <button 
            className={`start-test-btn ${!agreementChecked ? 'disabled' : ''}`}
            onClick={handleStartTest}
            disabled={!agreementChecked}
          >
            <FaPlay /> Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestInstructions;
