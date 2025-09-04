import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout/AdminLayout';
import './BatchManagement.css';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('batches');
  
  // Batch form state
  const [batchForm, setBatchForm] = useState({
    name: '',
    currentSubject: 'A',
    courseIds: []
  });
  
  // Session form state
  const [sessionForm, setSessionForm] = useState({
    batchId: '',
    subject: 'A',
    startAt: '',
    endAt: '',
    joinUrl: ''
  });

  const API_BASE = '/api/admin';

  useEffect(() => {
    fetchBatches();
    fetchCourses();
    fetchSessions();
  }, []);

  const makeRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await makeRequest('/batches');
      setBatches(data.items || []);
    } catch (error) {
      toast.error('Failed to load batches');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data.items || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await makeRequest('/sessions');
      setSessions(data.items || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createBatch = async (e) => {
    e.preventDefault();
    try {
      const data = await makeRequest('/batches', {
        method: 'POST',
        body: JSON.stringify(batchForm)
      });
      
      setBatches([data.item, ...batches]);
      setBatchForm({ name: '', currentSubject: 'A', courseIds: [] });
      toast.success('Batch created successfully');
    } catch (error) {
      toast.error('Failed to create batch');
    }
  };

  const updateBatch = async (id, updates) => {
    try {
      const data = await makeRequest(`/batch/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      
      setBatches(batches.map(b => b._id === id ? data.item : b));
      toast.success('Batch updated');
    } catch (error) {
      toast.error('Failed to update batch');
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    try {
      const data = await makeRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionForm)
      });
      
      setSessions([data.item, ...sessions]);
      setSessionForm({ batchId: '', subject: 'A', startAt: '', endAt: '', joinUrl: '' });
      toast.success('Session created successfully');
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const updateSession = async (id, updates) => {
    try {
      const data = await makeRequest(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      
      setSessions(sessions.map(s => s._id === id ? data.item : s));
      toast.success('Session updated');
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const markSubjectDone = async (batchId, subject) => {
    // This would require additional API endpoint to mark progress
    toast.info('Mark subject done feature - API implementation needed');
  };

  return (
    <AdminLayout>
      <div className="batch-management">
        <div className="batch-header">
          <h1>Batch & Session Management</h1>
          <div className="batch-tabs">
            <button 
              className={`tab-btn ${activeTab === 'batches' ? 'active' : ''}`}
              onClick={() => setActiveTab('batches')}
            >
              Batches
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions
            </button>
          </div>
        </div>

        {activeTab === 'batches' && (
          <div className="batches-section">
            <div className="batch-form-card">
              <h3>Create New Batch</h3>
              <form onSubmit={createBatch} className="batch-form">
                <div className="form-group">
                  <label>Batch Name</label>
                  <input
                    type="text"
                    value={batchForm.name}
                    onChange={(e) => setBatchForm({...batchForm, name: e.target.value})}
                    placeholder="Master Batch 2025"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Current Subject</label>
                  <select
                    value={batchForm.currentSubject}
                    onChange={(e) => setBatchForm({...batchForm, currentSubject: e.target.value})}
                  >
                    <option value="A">Subject A</option>
                    <option value="B">Subject B</option>
                    <option value="C">Subject C</option>
                    <option value="D">Subject D</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Courses</label>
                  <div className="course-selection">
                    {courses.map(course => (
                      <label key={course._id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={batchForm.courseIds.includes(course._id)}
                          onChange={(e) => {
                            const courseIds = e.target.checked
                              ? [...batchForm.courseIds, course._id]
                              : batchForm.courseIds.filter(id => id !== course._id);
                            setBatchForm({...batchForm, courseIds});
                          }}
                        />
                        {course.name}
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="submit-btn">Create Batch</button>
              </form>
            </div>

            <div className="batches-list">
              <h3>Existing Batches</h3>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="batch-grid">
                  {batches.map(batch => (
                    <div key={batch._id} className="batch-card">
                      <div className="batch-card-header">
                        <h4>{batch.name}</h4>
                        <span className={`subject-chip subject-${batch.currentSubject}`}>
                          Subject {batch.currentSubject}
                        </span>
                      </div>
                      
                      <div className="batch-courses">
                        <p>Courses: {(batch.courseIds || []).length}</p>
                        <div className="course-names">
                          {(batch.courseIds || []).map(courseId => {
                            const course = courses.find(c => c._id === courseId);
                            return course ? (
                              <span key={courseId} className="course-tag">
                                {course.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className="batch-actions">
                        <select
                          value={batch.currentSubject}
                          onChange={(e) => updateBatch(batch._id, { currentSubject: e.target.value })}
                          className="subject-select"
                        >
                          <option value="A">Subject A</option>
                          <option value="B">Subject B</option>
                          <option value="C">Subject C</option>
                          <option value="D">Subject D</option>
                        </select>
                        
                        <button
                          onClick={() => markSubjectDone(batch._id, batch.currentSubject)}
                          className="mark-done-btn"
                          title="Mark current subject as done for attendees"
                        >
                          Mark Subject Done
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="sessions-section">
            <div className="session-form-card">
              <h3>Schedule Live Session</h3>
              <form onSubmit={createSession} className="session-form">
                <div className="form-group">
                  <label>Batch</label>
                  <select
                    value={sessionForm.batchId}
                    onChange={(e) => setSessionForm({...sessionForm, batchId: e.target.value})}
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name} (Current: Subject {batch.currentSubject})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <select
                    value={sessionForm.subject}
                    onChange={(e) => setSessionForm({...sessionForm, subject: e.target.value})}
                  >
                    <option value="A">Subject A</option>
                    <option value="B">Subject B</option>
                    <option value="C">Subject C</option>
                    <option value="D">Subject D</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="datetime-local"
                      value={sessionForm.startAt}
                      onChange={(e) => setSessionForm({...sessionForm, startAt: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="datetime-local"
                      value={sessionForm.endAt}
                      onChange={(e) => setSessionForm({...sessionForm, endAt: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Join URL</label>
                  <input
                    type="url"
                    value={sessionForm.joinUrl}
                    onChange={(e) => setSessionForm({...sessionForm, joinUrl: e.target.value})}
                    placeholder="https://zoom.us/j/..."
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">Schedule Session</button>
              </form>
            </div>

            <div className="sessions-list">
              <h3>Scheduled Sessions</h3>
              <div className="sessions-grid">
                {sessions.map(session => (
                  <div key={session._id} className="session-card">
                    <div className="session-header">
                      <span className={`subject-chip subject-${session.subject}`}>
                        Subject {session.subject}
                      </span>
                      <span className="session-time">
                        {new Date(session.startAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="session-details">
                      <p><strong>Start:</strong> {new Date(session.startAt).toLocaleString()}</p>
                      <p><strong>End:</strong> {new Date(session.endAt).toLocaleString()}</p>
                      <p><strong>Join URL:</strong> 
                        <a href={session.joinUrl} target="_blank" rel="noopener noreferrer">
                          {session.joinUrl.substring(0, 50)}...
                        </a>
                      </p>
                    </div>

                    <div className="session-actions">
                      <input
                        type="url"
                        placeholder="Recording URL"
                        onBlur={(e) => {
                          if (e.target.value && e.target.value !== session.recordingUrl) {
                            updateSession(session._id, { recordingUrl: e.target.value });
                          }
                        }}
                        defaultValue={session.recordingUrl || ''}
                        className="recording-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BatchManagement;
