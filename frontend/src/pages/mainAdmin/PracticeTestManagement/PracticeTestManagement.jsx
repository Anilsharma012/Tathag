import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from "react-icons/fa";
import "./PracticeTestManagement.css";

const PracticeTestManagement = () => {
  const [practiceTests, setPracticeTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  useEffect(() => {
    fetchPracticeTests();
  }, []);

  const fetchPracticeTests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/practice-tests/admin/all`, {
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

  const handlePublishToggle = async (testId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/practice-tests/admin/${testId}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ published: !currentStatus })
      });

      if (response.ok) {
        fetchPracticeTests(); // Refresh the list
      } else {
        console.error('Failed to update publish status');
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this practice test?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/practice-tests/admin/${testId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          fetchPracticeTests(); // Refresh the list
        } else {
          console.error('Failed to delete practice test');
        }
      } catch (error) {
        console.error('Error deleting practice test:', error);
      }
    }
  };

  const openQuestionModal = (test) => {
    setSelectedTest(test);
    setShowQuestionModal(true);
  };

  if (loading) {
    return <div className="loading-spinner">Loading practice tests...</div>;
  }

  return (
    <div className="practice-test-management">
      <div className="management-header">
        <h2>Practice Test Management</h2>
        <button 
          className="create-test-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Create New Test
        </button>
      </div>

      <div className="tests-grid">
        {practiceTests.length === 0 ? (
          <div className="no-tests">
            <p>No practice tests found. Create your first practice test!</p>
          </div>
        ) : (
          practiceTests.map(test => (
            <div key={test._id} className="test-card">
              <div className="test-header">
                <h3>{test.title}</h3>
                <div className="test-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => openQuestionModal(test)}
                    title="Manage Questions"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    title="Edit Test"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(test._id)}
                    title="Delete Test"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="test-info">
                <div className="info-row">
                  <span className="label">Type:</span>
                  <span className={`test-type ${test.testType.toLowerCase()}`}>
                    {test.testType}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="label">Duration:</span>
                  <span>{test.duration} minutes</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Sections:</span>
                  <span>{test.sections.map(s => s.name).join(', ')}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Questions:</span>
                  <span>{test.totalQuestions}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Total Marks:</span>
                  <span>{test.totalMarks}</span>
                </div>
              </div>

              <div className="test-footer">
                <div className="publish-toggle">
                  <span>Published:</span>
                  <button 
                    className={`toggle-btn ${test.published ? 'active' : ''}`}
                    onClick={() => handlePublishToggle(test._id, test.published)}
                  >
                    {test.published ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
                <div className="created-date">
                  Created: {new Date(test.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateTestModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchPracticeTests}
        />
      )}

      {showQuestionModal && selectedTest && (
        <QuestionManagementModal 
          test={selectedTest}
          onClose={() => {
            setShowQuestionModal(false);
            setSelectedTest(null);
          }}
          onSuccess={fetchPracticeTests}
        />
      )}
    </div>
  );
};

// Create Test Modal Component
const CreateTestModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testType: 'Daily',
    duration: 180,
    sectionWiseTiming: false,
    instructions: '',
    sections: [
      { name: 'Quant', duration: 60 },
      { name: 'LRDI', duration: 60 },
      { name: 'VARC', duration: 60 }
    ]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/practice-tests/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        console.error('Failed to create practice test');
      }
    } catch (error) {
      console.error('Error creating practice test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index][field] = value;
    setFormData({ ...formData, sections: updatedSections });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-test-modal">
        <div className="modal-header">
          <h3>Create New Practice Test</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-test-form">
          <div className="form-group">
            <label>Test Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., CAT Quant Practice Set 1"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the test"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Test Type *</label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                required
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.sectionWiseTiming}
                onChange={(e) => setFormData({ ...formData, sectionWiseTiming: e.target.checked })}
              />
              Enable section-wise timing
            </label>
          </div>

          <div className="form-group">
            <label>Sections</label>
            <div className="sections-grid">
              {formData.sections.map((section, index) => (
                <div key={index} className="section-row">
                  <span className="section-name">{section.name}</span>
                  <input
                    type="number"
                    value={section.duration}
                    onChange={(e) => handleSectionChange(index, 'duration', parseInt(e.target.value))}
                    min="1"
                    placeholder="Duration (min)"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Test instructions (HTML allowed)"
              rows="5"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating...' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Question Management Modal Component
const QuestionManagementModal = ({ test, onClose, onSuccess }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('all');
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSection]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const sectionParam = selectedSection !== 'all' ? `?sectionName=${selectedSection}` : '';
      const response = await fetch(`/api/practice-tests/admin/${test._id}/questions${sectionParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content question-modal">
        <div className="modal-header">
          <h3>Manage Questions - {test.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="question-controls">
          <div className="section-filter">
            <label>Filter by Section:</label>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="all">All Sections</option>
              <option value="Quant">Quant</option>
              <option value="LRDI">LRDI</option>
              <option value="VARC">VARC</option>
            </select>
          </div>

          <button 
            className="add-question-btn"
            onClick={() => setShowAddQuestion(true)}
          >
            <FaPlus /> Add Question
          </button>
        </div>

        <div className="questions-list">
          {loading ? (
            <div>Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="no-questions">
              No questions found for this test. Add some questions to get started!
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question._id} className="question-item">
                <div className="question-header">
                  <span className="question-number">Q{index + 1}</span>
                  <span className="question-section">{question.sectionName}</span>
                  <div className="question-actions">
                    <button className="edit-question-btn">
                      <FaEdit />
                    </button>
                    <button className="delete-question-btn">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="question-text">
                  {question.questionText}
                </div>
                <div className="question-options">
                  {question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`option ${optIndex === question.correctOptionIndex ? 'correct' : ''}`}
                    >
                      {String.fromCharCode(65 + optIndex)}) {option}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {showAddQuestion && (
          <AddQuestionModal 
            testId={test._id}
            onClose={() => setShowAddQuestion(false)}
            onSuccess={() => {
              fetchQuestions();
              onSuccess();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Add Question Modal Component
const AddQuestionModal = ({ testId, onClose, onSuccess }) => {
  const [questionData, setQuestionData] = useState({
    sectionName: 'Quant',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 3,
    negativeMarks: 1,
    explanation: '',
    type: 'MCQ',
    difficultyLevel: 'Medium'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/practice-tests/admin/${testId}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        console.error('Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = value;
    setQuestionData({ ...questionData, options: updatedOptions });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content add-question-modal">
        <div className="modal-header">
          <h3>Add New Question</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-question-form">
          <div className="form-row">
            <div className="form-group">
              <label>Section *</label>
              <select
                value={questionData.sectionName}
                onChange={(e) => setQuestionData({ ...questionData, sectionName: e.target.value })}
                required
              >
                <option value="Quant">Quant</option>
                <option value="LRDI">LRDI</option>
                <option value="VARC">VARC</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty Level</label>
              <select
                value={questionData.difficultyLevel}
                onChange={(e) => setQuestionData({ ...questionData, difficultyLevel: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Question Text *</label>
            <textarea
              value={questionData.questionText}
              onChange={(e) => setQuestionData({ ...questionData, questionText: e.target.value })}
              required
              rows="4"
              placeholder="Enter the question text"
            />
          </div>

          <div className="form-group">
            <label>Options *</label>
            {questionData.options.map((option, index) => (
              <div key={index} className="option-input">
                <label className="option-label">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={questionData.correctOptionIndex === index}
                    onChange={() => setQuestionData({ ...questionData, correctOptionIndex: index })}
                  />
                  {String.fromCharCode(65 + index)})
                </label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Marks</label>
              <input
                type="number"
                value={questionData.marks}
                onChange={(e) => setQuestionData({ ...questionData, marks: parseInt(e.target.value) })}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Negative Marks</label>
              <input
                type="number"
                value={questionData.negativeMarks}
                onChange={(e) => setQuestionData({ ...questionData, negativeMarks: parseInt(e.target.value) })}
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Explanation</label>
            <textarea
              value={questionData.explanation}
              onChange={(e) => setQuestionData({ ...questionData, explanation: e.target.value })}
              rows="3"
              placeholder="Explanation for the correct answer"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding...' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PracticeTestManagement;
