import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiPlus,
  FiUsers,
  FiArrowRight,
  FiVideo,
  FiCheckSquare
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../../AdminLayout/AdminLayout';
import { FormDrawer } from '../../../../components/shared/Drawer/Drawer';
import SubjectChip from '../../../../components/shared/SubjectChip/SubjectChip';
import CourseSubjectMatrix from './CourseSubjectMatrix';
import StudentQueues from './StudentQueues';
import CoursePanel from './CoursePanel';
import './AcademicsBatches.css';
import { req } from '../../../../utils/http';

const AcademicsBatches = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [data, setData] = useState({
    batches: [],
    courses: [],
    matrix: [],
    stats: {}
  });
  
  // Drawer states
  const [sessionDrawer, setSessionDrawer] = useState(false);
  const [recordingDrawer, setRecordingDrawer] = useState(false);
  const [coursePanelOpen, setCoursePanelOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Form states
  const [sessionForm, setSessionForm] = useState({
    subject: 'A',
    startAt: '',
    endAt: '',
    joinUrl: ''
  });
  const [recordingForm, setRecordingForm] = useState({
    sessionId: '',
    recordingUrl: ''
  });
  const [bulkMarkForm, setBulkMarkForm] = useState({
    subject: 'A',
    enrollmentIds: []
  });

  // Student selection
  const [selectedStudents, setSelectedStudents] = useState([]);

  const fetchBatchesData = async () => {
    try {
      setLoading(true);
      const response = await req('get', '/admin/academics/batches', { params: { with: 'courses,stats' } });
      const result = response.data;
      
      if (result.success) {
        setData(result);
        
        // Set selected batch from URL or first batch
        const urlParams = new URLSearchParams(location.search);
        const selectedId = urlParams.get('selected');
        
        if (selectedId && result.batches.find(b => b.id === selectedId)) {
          setSelectedBatch(selectedId);
        } else if (result.batches.length > 0 && !selectedBatch) {
          setSelectedBatch(result.batches[0].id);
        }
      } else {
        throw new Error(result.message || 'Failed to load batches data');
      }
    } catch (error) {
      console.error('Batches fetch error:', error);
      toast.error('Failed to load batches data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesData();
  }, [location.search]);

  const advanceSubject = async () => {
    if (!selectedBatch) return;
    
    const batch = data.batches.find(b => b.id === selectedBatch);
    if (!batch) return;
    
    const subjects = ['A', 'B', 'C', 'D'];
    const currentIndex = subjects.indexOf(batch.currentSubject);
    const nextSubject = subjects[(currentIndex + 1) % subjects.length];
    
    const confirmed = window.confirm(
      `Advance batch "${batch.name}" from Subject ${batch.currentSubject} to Subject ${nextSubject}?\n\nThis will affect all students in this batch.`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await req('patch', `/admin/academics/batches/${selectedBatch}/current-subject`, { data: { currentSubject: nextSubject } });
      const result = response.data;
      
      if (result.success) {
        toast.success(`Batch advanced to Subject ${nextSubject}`);
        fetchBatchesData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to advance subject');
      }
    } catch (error) {
      console.error('Advance subject error:', error);
      toast.error('Failed to advance subject');
    }
  };

  const scheduleSession = async (e) => {
    e.preventDefault();
    
    if (!selectedBatch || !sessionForm.subject || !sessionForm.startAt || !sessionForm.endAt || !sessionForm.joinUrl) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const response = await req('post', '/admin/sessions', { data: {
        batchId: selectedBatch,
        subject: sessionForm.subject,
        startAt: sessionForm.startAt,
        endAt: sessionForm.endAt,
        joinUrl: sessionForm.joinUrl
      }});
      const result = response.data;
      
      if (result.success) {
        toast.success('Session scheduled successfully');
        setSessionDrawer(false);
        setSessionForm({ subject: 'A', startAt: '', endAt: '', joinUrl: '' });
        fetchBatchesData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Schedule session error:', error);
      toast.error('Failed to schedule session');
    }
  };

  const bulkMarkDone = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students first');
      return;
    }
    
    const confirmed = window.confirm(
      `Mark Subject ${bulkMarkForm.subject} as done for ${selectedStudents.length} selected students?`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await req('patch', '/admin/academics/progress/bulk-done', { data: {
        enrollmentIds: selectedStudents.map(s => s.enrollmentId),
        subject: bulkMarkForm.subject
      }});
      const result = response.data;
      
      if (result.success) {
        toast.success(`Marked ${selectedStudents.length} students as done for Subject ${bulkMarkForm.subject}`);
        setSelectedStudents([]);
        fetchBatchesData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to bulk mark done');
      }
    } catch (error) {
      console.error('Bulk mark done error:', error);
      toast.error('Failed to bulk mark done');
    }
  };

  const openCoursePanel = (course) => {
    setSelectedCourse(course);
    setCoursePanelOpen(true);
  };

  const selectedBatchData = data.batches.find(b => b.id === selectedBatch);

  return (
    <AdminLayout>
      <div className="academics-batches">
        <div className="batches-header">
          <div className="batches-header-content">
            <h1>Batch Management</h1>
            <p>Control live sessions and track student progress</p>
          </div>
        </div>

        {/* Batch Switcher & Controls */}
        <div className="batch-controls-section">
          <div className="batch-switcher">
            <label htmlFor="batch-select">Select Batch:</label>
            <select
              id="batch-select"
              value={selectedBatch || ''}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">Choose a batch...</option>
              {data.batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} (Subject {batch.currentSubject})
                </option>
              ))}
            </select>
          </div>

          {selectedBatchData && (
            <div className="batch-info">
              <div className="current-subject-pill">
                <span>Current Subject:</span>
                <SubjectChip subject={selectedBatchData.currentSubject} size="large" />
              </div>
              
              <div className="batch-actions">
                <button 
                  className="btn btn-primary"
                  onClick={advanceSubject}
                >
                  <FiArrowRight />
                  Advance to Next Subject
                </button>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => { setSessionForm(f => ({...f, subject: selectedBatchData.currentSubject })); setSessionDrawer(true); }}
                >
                  <FiPlus />
                  Schedule Live
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={() => setRecordingDrawer(true)}
                >
                  <FiVideo />
                  Attach Recording
                </button>
                
                <button 
                  className="btn btn-warning"
                  onClick={bulkMarkDone}
                  disabled={selectedStudents.length === 0}
                >
                  <FiCheckSquare />
                  Bulk Mark Done ({selectedStudents.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedBatchData ? (
          <div className="batch-content">
            {/* Course-Subject Matrix */}
            <CourseSubjectMatrix
              matrix={data.matrix}
              loading={loading}
              onCourseClick={openCoursePanel}
              onCellAction={(courseId, subject, action) => {
                // Handle inline cell actions
                console.log('Cell action:', courseId, subject, action);
              }}
            />

            {/* Student Queues */}
            <StudentQueues
              batchId={selectedBatch}
              loading={loading}
              selectedStudents={selectedStudents}
              onStudentSelect={setSelectedStudents}
            />
          </div>
        ) : (
          <div className="no-batch-selected">
            <FiUsers size={48} />
            <h3>Select a Batch</h3>
            <p>Choose a batch from the dropdown to view controls and student progress</p>
          </div>
        )}

        {/* Schedule Session Drawer */}
        <FormDrawer
          isOpen={sessionDrawer}
          onClose={() => setSessionDrawer(false)}
          title="Schedule Live Session"
          onSubmit={scheduleSession}
          submitLabel="Schedule Session"
        >
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
        </FormDrawer>

        {/* Course Panel Drawer */}
        <CoursePanel
          isOpen={coursePanelOpen}
          onClose={() => setCoursePanelOpen(false)}
          course={selectedCourse}
          batches={data.batches}
          onUpdate={fetchBatchesData}
        />
      </div>
    </AdminLayout>
  );
};

export default AcademicsBatches;
