import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MockTestInstructions.css';

const MockTestInstructions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`/api/mock-tests/test/${testId}/details`, {
        headers: authToken ? {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setTestDetails(data.test);
      } else {
        console.error('Failed to fetch test details:', data.message);
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions before proceeding.');
      return;
    }

    // Navigate to terms and conditions page
    navigate(`/student/mock-test/${testId}/terms`);
  };

  if (loading) {
    return (
      <div className="cat-instructions-page">
        <div className="cat-loading">
          <div className="cat-spinner"></div>
          <p>Loading instructions...</p>
        </div>
      </div>
    );
  }

  if (!testDetails) {
    return (
      <div className="cat-instructions-page">
        <div className="cat-error">
          <h3>Test Not Found</h3>
          <button onClick={() => navigate('/student/dashboard')}>
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-instructions-page">
      {/* CAT Style Header */}
      <div className="cat-header">
        <div className="cat-header-top">
          <div className="cat-logos">
            <div className="logo-item">CAT</div>
            <div className="logo-item">2024</div>
            <div className="logo-item">IIM</div>
            <div className="logo-item">TATHAGAT</div>
          </div>
          <div className="cat-title">
            <h1>COMMON ADMISSION TEST</h1>
            <h2>Mock Test Instructions</h2>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="cat-content">
        <div className="cat-main-panel">
          {/* Left Panel - Instructions */}
          <div className="cat-instructions-panel">
            <div className="instructions-header">
              <h3>INSTRUCTIONS</h3>
            </div>

            <div className="instructions-content">
              <div className="instruction-section">
                <h4>General Instructions:</h4>
                <ol className="instruction-list">
                  <li>
                    The number, type and pattern of questions, as well as sequence and timing of sections in the Mock Exam are only indicative and these are subject to variations from year to year as decided by the CAT Committee.
                  </li>
                  <li>
                    The time allowed to each section is {testDetails.sections?.[0]?.duration || 60} minutes and 20 seconds for each candidates and 20 seconds for PWD candidates) as soon as you start answering a section, the clock displayed on the top right corner of the screen will start. On expiry of allotted time, the clock will indicate the auto-submission. You will then need to move to the next section and start answering the next set of questions. The same process can be repeated for the other two sections. A summary of your answers will be displayed on your screen.
                  </li>
                  <li>
                    Each candidate will be provided at the beginning of the Mock Exam with an instruction sheet. The sheet will contain, among other things, details of the section-wise distribution of questions, marking scheme, time allotted for answering the questions in each section, instructions for submitting the answers of a section before moving to the next section.
                  </li>
                  <li>
                    You will be allowed to leave the test hall only after a maximum of {testDetails.duration} minutes.
                  </li>
                  <li>
                    Your time will be up and synchronized automatically upon the completion of the exam at the last section of your screen and display the results instantly. When all the candidates finish in your screening venue, you will be directed to complete the survey, which may be used for research purposes.
                  </li>
                  <li>
                    PWD candidates will be allocated {testDetails.duration + 20} minutes and 20 seconds for each section and {testDetails.duration + 60} minutes and 20 seconds by clicking on the Submit button. After 20 minutes and 20 seconds. However, the clock will be section-wise automatically end.
                  </li>
                  <li>
                    The question paper will have a mix of multiple choice questions (MCQ) type with options and Non-MCQ type.
                  </li>
                  <li>
                    A writing pad will be provided to the candidates for rough work, which will have to be returned after the test. Please note that only one writing pad will be provided to you. Candidates should check with their allotted centre if they require additional number on the writing pad.
                  </li>
                  <li>
                    The items/materials that are allowed to be used for computation: You will not be allowed to use any electronic, computing instrument, or device.
                  </li>
                  <li>
                    The question palette displayed on the right side of the screen will show the status of each question with the help of one of the following symbols:
                  </li>
                </ol>

                <div className="question-status-legend">
                  <div className="status-row">
                    <div className="status-item">
                      <div className="status-box not-visited">
                        <span>1</span>
                      </div>
                      <span className="status-label">Question Number on right side is Missing</span>
                    </div>
                  </div>
                  
                  <div className="status-row">
                    <div className="status-item">
                      <div className="status-box not-answered">
                        <span>A</span>
                      </div>
                      <span className="status-label">You have not visited the question yet.</span>
                    </div>
                  </div>

                  <div className="status-row">
                    <div className="status-item">
                      <div className="status-box answered">
                        <span>B</span>
                      </div>
                      <span className="status-label">You have visited the question but not answered it.</span>
                    </div>
                  </div>

                  <div className="status-row">
                    <div className="status-item">
                      <div className="status-box review">
                        <span>C</span>
                      </div>
                      <span className="status-label">You have answered the question but have marked it as Marked for Review.</span>
                    </div>
                  </div>

                  <div className="status-row">
                    <div className="status-item">
                      <div className="status-box answered-review">
                        <span>D</span>
                      </div>
                      <span className="status-label">You have answered the question but have not marked it as Marked for Review.</span>
                    </div>
                  </div>

                  <div className="status-row">
                    <div className="status-item">
                      <div className="status-box marked-review">
                        <span>5*</span>
                      </div>
                      <span className="status-label">You have answered the question as well as marked it as Marked for Review.</span>
                    </div>
                  </div>
                </div>

                <p><strong>Answers to all questions flagged as 'Marked for Review' (Some No.) will not be automatically considered as submitted for evaluation at the end of the time allotted for that section.</strong></p>

                <div className="instruction-section">
                  <p>10. You can click on the arrow which appears to the right of the question palette to collapse the question palette in case you want to view the entire screen space. To view the question palette again, you can click on the arrow which appears on the right side of the computer console. Please note that you may have to scroll down to view the full question and options in some cases.</p>
                  
                  <p><strong>To answer a question, you will have to do the following:</strong></p>
                  
                  <ol type="a">
                    <li>Click on the question number in the Question palette to go to that question directly.</li>
                    <li>Select an answer for an MCQ by clicking on the radio button placed just before the choice.</li>
                  </ol>
                  
                  <p><strong>For a Non-MCQ, enter only a whole number as the answer in the space provided on the screen using the on-screen keyboard. For example, if the correct answer is a Non-MCQ is 50, then enter ONLY 50 and NOT 50.0 or 50.00.</strong></p>
                  
                  <ol type="a" start="3">
                    <li>Click on Save & Next to save your answer for the current question and then go to the next question.</li>
                  </ol>
                  
                  <p>Alternatively, you may click on Mark for Review & Next to save your answer for the current question and mark it for review, and then move to the next question.</p>
                  
                  <p><strong>Caution: Your answer for the current question will not be saved, if you navigate directly to another question by clicking on a question number and not click Save & Next or Mark for Review & Next button.</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Profile & Actions */}
          <div className="cat-profile-panel">
            <div className="profile-section">
              <div className="profile-image">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    <span>👤</span>
                  </div>
                </div>
              </div>
              <div className="profile-info">
                <h4>JOHN SMITH</h4>
                <p>Candidate</p>
              </div>
            </div>

            <div className="test-details-box">
              <h4>Test Details</h4>
              <div className="detail-row">
                <span>Test Name:</span>
                <span>{testDetails.title}</span>
              </div>
              <div className="detail-row">
                <span>Duration:</span>
                <span>{testDetails.duration} minutes</span>
              </div>
              <div className="detail-row">
                <span>Questions:</span>
                <span>{testDetails.totalQuestions}</span>
              </div>
              <div className="detail-row">
                <span>Maximum Marks:</span>
                <span>{testDetails.totalMarks}</span>
              </div>
            </div>

            <div className="terms-section">
              <label className="cat-checkbox">
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  I have read and understood all the instructions and agree to abide by them.
                </span>
              </label>
            </div>

            <div className="action-buttons">
              <button 
                className="cat-btn cat-btn-back"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button 
                className={`cat-btn cat-btn-next ${!agreedToTerms ? 'disabled' : ''}`}
                onClick={handleStartTest}
                disabled={!agreedToTerms}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestInstructions;
