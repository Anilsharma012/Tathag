import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MockTestPage.css';
import { fetchWithErrorHandling } from '../../../utils/api';
import {
  FiClock,
  FiUsers,
  FiFileText,
  FiPlay,
  FiLock,
  FiUnlock,
  FiStar,
  FiTrendingUp,
  FiFilter,
  FiSearch,
  FiCheckCircle,
  FiEye,
  FiBarChart2
} from 'react-icons/fi'

const MockTestPage = () => {
  const navigate = useNavigate();
  const [mockTestSeries, setMockTestSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });

  // Fetch published mock test series
  const fetchMockTestSeries = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 20,
        category: filters.category !== 'all' ? filters.category : ''
      });

      const data = await fetchWithErrorHandling(`/api/mock-tests/series?${queryParams}`);

      if (data.success) {
        setMockTestSeries(data.series || data.data || []);
      } else {
        console.error('Failed to fetch mock test series:', data.message);
        setMockTestSeries([]);
      }
    } catch (error) {
      console.error('Error fetching mock test series:', error);
      setMockTestSeries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tests in a series
  const fetchTestsInSeries = async (seriesId) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization header if we have a valid token
      if (authToken && authToken !== 'null' && authToken !== 'undefined') {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/mock-tests/series/${seriesId}/tests`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setTests(data.tests || []);
        setSelectedSeries(data.series);
      } else {
        console.error('Failed to fetch tests:', data.message);
        setTests([]);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockTestSeries();
  }, [filters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTestStatusIcon = (test) => {
    if (test.hasAttempted) {
      if (test.isCompleted) {
        return <FiCheckCircle className="status-icon completed" />;
      } else {
        return <FiPlay className="status-icon attempted" />;
      }
    } else if (test.isFree) {
      return <FiUnlock className="status-icon free" />;
    } else {
      return <FiLock className="status-icon locked" />;
    }
  };

  const getTestStatusText = (test) => {
    if (test.hasAttempted) {
      if (test.isCompleted) {
        return `Completed • Score: ${test.score}`;
      } else {
        return 'In Progress';
      }
    } else if (test.isFree) {
      return 'Free';
    } else {
      return 'Locked';
    }
  };

  const handleStartTest = (testId) => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    if (!authToken || authToken === 'null' || authToken === 'undefined') {
      alert('Please login to start the test');
      navigate('/Login');
      return;
    }

    // Navigate to test instructions page
    navigate(`/student/mock-test/${testId}/instructions`);
  };

  const MockTestSeriesCard = ({ series }) => (
    <div className="mocktest-series-card">
      <div className="series-header">
        <div className="series-info">
          <h3>{series.title}</h3>
          <p className="series-description">{series.description}</p>
          <div className="series-meta">
            <span className="category-tag">{series.category}</span>
            <div className="series-stats">
              <span><FiFileText /> {series.totalTests} Tests</span>
              <span><FiUsers /> {series.enrolledCount || 0} Students</span>
              <span><FiClock /> {series.validity} Days</span>
            </div>
          </div>
        </div>
        {series.thumbnail && (
          <div className="series-thumbnail">
            <img src={series.thumbnail} alt={series.title} />
          </div>
        )}
      </div>

      <div className="series-footer">
        <div className="series-pricing">
          {series.price > 0 ? (
            <div className="price-info">
              <span className="price">₹{series.price}</span>
              <span className="free-tests">{series.freeTests} Free Tests</span>
            </div>
          ) : (
            <span className="price free">Free</span>
          )}
        </div>
        <button 
          className="explore-btn"
          onClick={() => fetchTestsInSeries(series._id)}
        >
          Explore Tests
        </button>
      </div>
    </div>
  );

  const MockTestCard = ({ test }) => (
    <div className={`mocktest-card ${test.hasAttempted ? 'attempted' : ''}`}>
      <div className="test-header">
        <div className="test-info">
          <h4>{test.title}</h4>
          <p className="test-description">{test.description}</p>
        </div>
        <div className="test-status">
          {getTestStatusIcon(test)}
        </div>
      </div>

      <div className="test-details">
        <div className="test-meta">
          <div className="meta-item">
            <FiClock />
            <span>{test.duration} mins</span>
          </div>
          <div className="meta-item">
            <FiFileText />
            <span>{test.totalQuestions} Questions</span>
          </div>
          <div className="meta-item">
            <FiTrendingUp />
            <span>{test.totalMarks} Marks</span>
          </div>
        </div>

        <div className="test-sections">
          <h5>Sections:</h5>
          <div className="sections-list">
            {test.sections?.map((section, index) => (
              <div key={index} className="section-item">
                <span className="section-name">{section.name}</span>
                <span className="section-questions">{section.totalQuestions}Q</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="test-footer">
        <div className="test-status-text">
          <span className={`status ${test.hasAttempted ? 'attempted' : test.isFree ? 'free' : 'locked'}`}>
            {getTestStatusText(test)}
          </span>
          {test.hasAttempted && test.attemptDate && (
            <span className="attempt-date">
              Attempted on {formatDate(test.attemptDate)}
            </span>
          )}
        </div>
        <div className="test-actions">
          {test.hasAttempted ? (
            <div className="action-buttons">
              <button className="action-btn secondary">
                <FiBarChart2 /> View Results
              </button>
              {!test.isCompleted && (
                <button 
                  className="action-btn primary"
                  onClick={() => handleStartTest(test._id)}
                >
                  <FiPlay /> Resume
                </button>
              )}
            </div>
          ) : (
            <button 
              className={`start-btn ${test.isFree ? 'free' : 'locked'}`}
              onClick={() => test.isFree && handleStartTest(test._id)}
              disabled={!test.isFree}
            >
              {test.isFree ? (
                <>
                  <FiPlay /> Start Test
                </>
              ) : (
                <>
                  <FiLock /> Purchase Required
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mocktest-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Mock Tests</h1>
          <p>Practice with CAT-style mock tests to improve your performance</p>
        </div>
      </div>

      {!selectedSeries ? (
        <>
          <div className="filters-section">
            <div className="filters-container">
              <div className="search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search mock test series..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="all">All Categories</option>
                <option value="CAT">CAT</option>
                <option value="XAT">XAT</option>
                <option value="SNAP">SNAP</option>
                <option value="NMAT">NMAT</option>
                <option value="CMAT">CMAT</option>
                <option value="MAT">MAT</option>
                <option value="GMAT">GMAT</option>
              </select>
            </div>
          </div>

          <div className="series-section">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading mock test series...</p>
              </div>
            ) : mockTestSeries.length === 0 ? (
              <div className="empty-state">
                <FiFileText size={48} />
                <h3>No Mock Test Series Available</h3>
                <p>Check back later for new mock test series.</p>
              </div>
            ) : (
              <div className="series-grid">
                {mockTestSeries.map((series) => (
                  <MockTestSeriesCard key={series._id} series={series} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="tests-section">
          <div className="tests-header">
            <button 
              className="back-btn"
              onClick={() => {
                setSelectedSeries(null);
                setTests([]);
              }}
            >
              ← Back to Series
            </button>
            <div className="series-info">
              <h2>{selectedSeries.title}</h2>
              <p>{selectedSeries.description}</p>
              <div className="series-summary">
                <span><FiFileText /> {tests.length} Tests Available</span>
                <span><FiUnlock /> {tests.filter(t => t.isFree).length} Free Tests</span>
              </div>
            </div>
          </div>

          <div className="tests-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading tests...</p>
              </div>
            ) : tests.length === 0 ? (
              <div className="empty-state">
                <FiFileText size={48} />
                <h3>No Tests Available</h3>
                <p>Tests will be added to this series soon.</p>
              </div>
            ) : (
              tests.map((test) => (
                <MockTestCard key={test._id} test={test} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTestPage;
