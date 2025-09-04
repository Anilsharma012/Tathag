import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaQuestionCircle, FaPlay, FaEye, FaFilter } from "react-icons/fa";
import "./StudentPracticeTests.css";

const StudentPracticeTests = () => {
  const [practiceTests, setPracticeTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [testHistory, setTestHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'history'
  const navigate = useNavigate();

  useEffect(() => {
    fetchPracticeTests();
    fetchTestHistory();
  }, [filter]);

  const fetchPracticeTests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const filterParam = filter !== 'all' ? `?testType=${filter}` : '';
      const response = await fetch(`/api/practice-tests/student/published${filterParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPracticeTests(data.practiceTests);
      } else {
        console.error('Failed to fetch practice tests');
      }
    } catch (error) {
      console.error('Error fetching practice tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/practice-tests/student/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
    }
  };

  const handleStartTest = async (testId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to start the test');
      navigate('/login');
      return;
    }

    // Navigate to test instructions page
    navigate(`/student/practice-tests/${testId}/instructions`);
  };

  const handleViewResult = (testId) => {
    navigate(`/student/practice-tests/${testId}/result`);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getScorePercentage = (score) => {
    if (!score?.overall) return 0;
    return Math.round((score.overall.scoreObtained / score.overall.totalMarks) * 100);
  };

  if (loading) {
    return (
      <div className="practice-tests-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading practice tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-tests-container">
      <div className="practice-header">
        <h1>Practice Tests</h1>
        <p>Sharpen your skills with CAT-style practice tests</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Tests
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            My Tests History
          </button>
        </div>
      </div>

      {activeTab === 'available' && (
        <>
          <div className="filter-section">
            <div className="filter-container">
              <FaFilter className="filter-icon" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tests</option>
                <option value="Daily">Daily Tests</option>
                <option value="Weekly">Weekly Tests</option>
              </select>
            </div>
          </div>

          <div className="tests-grid">
            {practiceTests.length === 0 ? (
              <div className="no-tests">
                <div className="no-tests-content">
                  <FaQuestionCircle className="no-tests-icon" />
                  <h3>No practice tests available</h3>
                  <p>New tests are added regularly. Check back soon!</p>
                </div>
              </div>
            ) : (
              practiceTests.map(test => (
                <div key={test._id} className="test-card">
                  <div className="test-card-header">
                    <h3 className="test-title">{test.title}</h3>
                    <span className={`test-type ${test.testType.toLowerCase()}`}>
                      {test.testType}
                    </span>
                  </div>

                  {test.description && (
                    <p className="test-description">{test.description}</p>
                  )}

                  <div className="test-details">
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <span>Duration: {formatDuration(test.duration)}</span>
                    </div>
                    <div className="detail-item">
                      <FaQuestionCircle className="detail-icon" />
                      <span>Questions: {test.totalQuestions}</span>
                    </div>
                    <div className="detail-item">
                      <span className="marks-badge">Marks: {test.totalMarks}</span>
                    </div>
                  </div>

                  <div className="sections-info">
                    <h4>Sections:</h4>
                    <div className="sections-list">
                      {test.sections.map((section, index) => (
                        <div key={index} className="section-item">
                          <span className="section-name">{section.name}</span>
                          <span className="section-duration">{formatDuration(section.duration)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="test-card-footer">
                    <div className="test-meta">
                      <span className="created-date">
                        Added: {formatDate(test.createdAt)}
                      </span>
                    </div>
                    <button 
                      className="start-test-btn"
                      onClick={() => handleStartTest(test._id)}
                    >
                      <FaPlay /> Start Test
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          {testHistory.length === 0 ? (
            <div className="no-history">
              <div className="no-history-content">
                <FaQuestionCircle className="no-history-icon" />
                <h3>No test history found</h3>
                <p>Take your first practice test to see results here!</p>
                <button 
                  className="switch-tab-btn"
                  onClick={() => setActiveTab('available')}
                >
                  Browse Available Tests
                </button>
              </div>
            </div>
          ) : (
            <div className="history-grid">
              {testHistory.map(history => (
                <div key={history._id} className="history-card">
                  <div className="history-header">
                    <h3>{history.practiceTestId.title}</h3>
                    <span className={`test-type ${history.practiceTestId.testType.toLowerCase()}`}>
                      {history.practiceTestId.testType}
                    </span>
                  </div>

                  <div className="score-summary">
                    <div className="overall-score">
                      <span className="score-label">Overall Score</span>
                      <span className="score-value">
                        {history.scores.overall.scoreObtained} / {history.scores.overall.totalMarks}
                      </span>
                      <span className="score-percentage">
                        ({getScorePercentage(history.scores)}%)
                      </span>
                    </div>
                  </div>

                  <div className="test-stats">
                    <div className="stat-item">
                      <span className="stat-label">Questions</span>
                      <span className="stat-value">{history.scores.overall.totalQuestions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Attempted</span>
                      <span className="stat-value">{history.scores.overall.attempted}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Correct</span>
                      <span className="stat-value correct">{history.scores.overall.correct}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Wrong</span>
                      <span className="stat-value wrong">{history.scores.overall.wrong}</span>
                    </div>
                  </div>

                  <div className="history-footer">
                    <div className="test-date">
                      Completed: {formatDate(history.testEndTime)}
                    </div>
                    <button 
                      className="view-result-btn"
                      onClick={() => handleViewResult(history.practiceTestId._id)}
                    >
                      <FaEye /> View Result
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPracticeTests;
