import React, { useState, useEffect } from 'react';
import { FiRotateCcw, FiLink, FiUnlink, FiCalendar, FiVideo, FiPlay } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Drawer from '../../../../components/shared/Drawer/Drawer';
import SubjectChip from '../../../../components/shared/SubjectChip/SubjectChip';
import './CoursePanel.css';

const CoursePanel = ({ 
  isOpen = false, 
  onClose, 
  course = null, 
  batches = [], 
  onUpdate = null 
}) => {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [startSubjectForm, setStartSubjectForm] = useState('A');
  const [batchAttachForm, setBatchAttachForm] = useState({
    selectedBatches: [],
    action: 'attach'
  });

  useEffect(() => {
    if (isOpen && course) {
      setStartSubjectForm(course.startSubject || 'A');
      fetchCourseSessions();
      
      // Set currently attached batches
      const attachedBatches = batches
        .filter(batch => (batch.courseIds || []).some(cId => 
          String(cId._id || cId) === String(course.courseId)
        ))
        .map(batch => batch.id);
      
      setBatchAttachForm({
        selectedBatches: attachedBatches,
        action: 'set'
      });
    }
  }, [isOpen, course, batches]);

  const fetchCourseSessions = async () => {
    if (!course) return;
    
    try {
      setLoadingSessions(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // Get sessions for all subjects for this course's batches
      const batchIds = batches
        .filter(batch => (batch.courseIds || []).some(cId => 
          String(cId._id || cId) === String(course.courseId)
        ))
        .map(batch => batch.id);
      
      if (batchIds.length === 0) {
        setSessions([]);
        return;
      }
      
      // Fetch sessions for all batch IDs
      const sessionsPromises = batchIds.map(batchId =>
        fetch(`/api/admin/batch/sessions?batchId=${batchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      const responses = await Promise.all(sessionsPromises);
      const sessionData = await Promise.all(
        responses.map(response => response.json())
      );
      
      // Combine and sort sessions
      const allSessions = sessionData
        .filter(data => data.success)
        .flatMap(data => data.items || [])
        .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))
        .slice(0, 10); // Last 10 sessions
      
      setSessions(allSessions);
    } catch (error) {
      console.error('Fetch sessions error:', error);
      toast.error('Failed to load course sessions');
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const changeStartSubject = async () => {
    if (!course || startSubjectForm === course.startSubject) return;
    
    const confirmed = window.confirm(
      `Change start subject for "${course.courseName}" from ${course.startSubject} to ${startSubjectForm}?\n\nThis will affect the subject rotation order for all enrolled students.`
    );
    
    if (!confirmed) return;
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/academics/courses/${course.courseId}/start-subject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startSubject: startSubjectForm })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Start subject changed to ${startSubjectForm}`);
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.message || 'Failed to change start subject');
      }
    } catch (error) {
      console.error('Change start subject error:', error);
      toast.error('Failed to change start subject');
    }
  };

  const updateBatchAttachment = async () => {
    if (!course) return;
    
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // Update each batch's course attachment
      for (const batch of batches) {
        const isCurrentlyAttached = (batch.courseIds || []).some(cId => 
          String(cId._id || cId) === String(course.courseId)
        );
        const shouldBeAttached = batchAttachForm.selectedBatches.includes(batch.id);
        
        if (isCurrentlyAttached !== shouldBeAttached) {
          const action = shouldBeAttached ? 'add' : 'remove';
          const courseIds = [course.courseId];
          
          const response = await fetch(`/api/admin/academics/batches/${batch.id}/courses`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseIds, action })
          });

          if (!response.ok) {
            throw new Error(`Failed to update batch ${batch.name}`);
          }
        }
      }
      
      toast.success('Batch attachments updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Update batch attachment error:', error);
      toast.error('Failed to update batch attachments');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getRotatedOrder = () => {
    if (!course) return [];
    const subjects = ['A', 'B', 'C', 'D'];
    const startIndex = subjects.indexOf(course.startSubject || 'A');
    return [...subjects.slice(startIndex), ...subjects.slice(0, startIndex)];
  };

  if (!course) return null;

  const rotatedOrder = getRotatedOrder();
  const attachedBatches = batches.filter(batch => 
    batchAttachForm.selectedBatches.includes(batch.id)
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={course.courseName}
      size="large"
      position="right"
    >
      <div className="course-panel">
        {/* Course Overview */}
        <div className="panel-section">
          <h3>Course Overview</h3>
          <div className="course-overview">
            <div className="overview-item">
              <label>Start Subject:</label>
              <SubjectChip subject={course.startSubject || 'A'} />
            </div>
            <div className="overview-item">
              <label>Subject Rotation:</label>
              <div className="rotation-display">
                {rotatedOrder.map((subject, index) => (
                  <React.Fragment key={subject}>
                    <SubjectChip subject={subject} size="small" />
                    {index < rotatedOrder.length - 1 && <span className="arrow">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="overview-item">
              <label>Validity Policy:</label>
              <span>12 months from enrollment</span>
            </div>
          </div>
        </div>

        {/* Change Start Subject */}
        <div className="panel-section">
          <h3>Change Start Subject</h3>
          <div className="form-group">
            <label>New Start Subject:</label>
            <select
              value={startSubjectForm}
              onChange={(e) => setStartSubjectForm(e.target.value)}
            >
              <option value="A">Subject A</option>
              <option value="B">Subject B</option>
              <option value="C">Subject C</option>
              <option value="D">Subject D</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={changeStartSubject}
            disabled={startSubjectForm === course.startSubject}
          >
            <FiRotateCcw />
            Change Start Subject
          </button>
        </div>

        {/* Batch Attachment */}
        <div className="panel-section">
          <h3>Batch Attachment</h3>
          <div className="form-group">
            <label>Attached to Batches:</label>
            <div className="batch-checkboxes">
              {batches.map(batch => (
                <label key={batch.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={batchAttachForm.selectedBatches.includes(batch.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBatchAttachForm(prev => ({
                        ...prev,
                        selectedBatches: checked
                          ? [...prev.selectedBatches, batch.id]
                          : prev.selectedBatches.filter(id => id !== batch.id)
                      }));
                    }}
                  />
                  <span>{batch.name}</span>
                  <SubjectChip subject={batch.currentSubject} size="small" />
                </label>
              ))}
            </div>
          </div>
          
          {attachedBatches.length > 0 && (
            <div className="attached-batches-summary">
              <strong>Currently attached to:</strong>
              <div className="attached-batches-list">
                {attachedBatches.map(batch => (
                  <span key={batch.id} className="attached-batch-tag">
                    {batch.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <button
            className="btn btn-secondary"
            onClick={updateBatchAttachment}
          >
            <FiLink />
            Update Attachments
          </button>
        </div>

        {/* Recent Sessions */}
        <div className="panel-section">
          <h3>Recent Sessions</h3>
          {loadingSessions ? (
            <div className="loading-sessions">
              <div className="loading-spinner"></div>
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="no-sessions">
              <FiCalendar size={32} />
              <p>No sessions found for this course</p>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.map(session => (
                <div key={session._id} className="session-item">
                  <div className="session-header">
                    <SubjectChip subject={session.subject} size="small" />
                    <span className="session-date">
                      {formatDateTime(session.startAt)}
                    </span>
                  </div>
                  <div className="session-details">
                    <div className="session-duration">
                      {formatDateTime(session.startAt)} - {formatDateTime(session.endAt)}
                    </div>
                    <div className="session-actions">
                      {session.recordingUrl ? (
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="session-action-btn recording"
                        >
                          <FiVideo size={14} />
                          Recording
                        </a>
                      ) : (
                        <a
                          href={session.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="session-action-btn live"
                        >
                          <FiPlay size={14} />
                          Join URL
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default CoursePanel;
