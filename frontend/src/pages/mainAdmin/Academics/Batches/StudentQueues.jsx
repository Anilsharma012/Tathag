import React, { useState, useEffect } from 'react';
import { FiUser, FiCheck, FiSettings, FiClock, FiPlay, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Table from '../../../../components/shared/Table/Table';
import SubjectChip from '../../../../components/shared/SubjectChip/SubjectChip';
import './StudentQueues.css';

const StudentQueues = ({ 
  batchId, 
  loading = false, 
  selectedStudents = [], 
  onStudentSelect = null 
}) => {
  const [activeTab, setActiveTab] = useState('joinLiveNow');
  const [studentsData, setStudentsData] = useState({
    students: [],
    queues: {
      joinLiveNow: [],
      backlogRecorded: [],
      completed: []
    }
  });
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchStudents = async () => {
    if (!batchId) {
      setStudentsData({
        students: [],
        queues: { joinLiveNow: [], backlogRecorded: [], completed: [] }
      });
      return;
    }

    try {
      setLoadingStudents(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/academics/students/${batchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStudentsData(result);
      } else {
        throw new Error(result.message || 'Failed to load students');
      }
    } catch (error) {
      console.error('Students fetch error:', error);
      toast.error('Failed to load students');
      setStudentsData({
        students: [],
        queues: { joinLiveNow: [], backlogRecorded: [], completed: [] }
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [batchId]);

  const markStudentDone = async (student, subject) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await fetch('/api/admin/academics/progress/bulk-done', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollmentIds: [student.enrollmentId],
          subject: subject || student.nextSubject
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Marked ${student.name} as done for Subject ${subject || student.nextSubject}`);
        fetchStudents(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to mark done');
      }
    } catch (error) {
      console.error('Mark done error:', error);
      toast.error('Failed to mark student as done');
    }
  };

  const openStudentProfile = (student) => {
    // Placeholder for student profile functionality
    toast.info(`Opening profile for ${student.name} - Feature coming soon`);
  };

  const columns = [
    {
      key: 'avatar',
      title: '',
      sortable: false,
      className: 'text-center',
      render: (value, row) => (
        <div className="student-avatar">
          {row.avatar ? (
            <img src={row.avatar} alt={row.name} className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              <FiUser />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      title: 'Student',
      render: (value, row) => (
        <div className="student-info">
          <div className="student-name">{row.name}</div>
          <div className="student-email">{row.email}</div>
        </div>
      )
    },
    {
      key: 'course.name',
      title: 'Course',
      render: (value, row) => (
        <div className="course-info">
          <div className="course-name">{row.course.name}</div>
        </div>
      )
    },
    {
      key: 'nextSubject',
      title: 'Next Subject',
      render: (value, row) => (
        value ? <SubjectChip subject={value} size="small" /> : (
          <span className="completed-badge">All Done</span>
        )
      )
    },
    {
      key: 'validityLeft',
      title: 'Validity',
      render: (value, row) => (
        <div className={`validity-info ${value < 7 ? 'validity-warning' : ''}`}>
          <FiClock size={14} />
          {value} days
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      className: 'text-center',
      render: (value, row) => (
        <div className="student-actions">
          {row.nextSubject && (
            <button
              className="action-btn mark-done-btn"
              onClick={() => markStudentDone(row, row.nextSubject)}
              title={`Mark Subject ${row.nextSubject} as done`}
            >
              <FiCheck size={14} />
            </button>
          )}
          <button
            className="action-btn profile-btn"
            onClick={() => openStudentProfile(row)}
            title="Open student profile"
          >
            <FiSettings size={14} />
          </button>
        </div>
      )
    }
  ];

  const handleRowSelect = (student, checked) => {
    if (!onStudentSelect) return;
    
    let newSelection = [...selectedStudents];
    
    if (checked) {
      if (!newSelection.find(s => s.enrollmentId === student.enrollmentId)) {
        newSelection.push(student);
      }
    } else {
      newSelection = newSelection.filter(s => s.enrollmentId !== student.enrollmentId);
    }
    
    onStudentSelect(newSelection);
  };

  const tabs = [
    {
      key: 'joinLiveNow',
      label: 'Join Live Now',
      icon: FiPlay,
      count: studentsData.queues.joinLiveNow.length,
      color: 'success'
    },
    {
      key: 'backlogRecorded',
      label: 'Backlog (Recorded)',
      icon: FiBook,
      count: studentsData.queues.backlogRecorded.length,
      color: 'warning'
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: FiCheck,
      count: studentsData.queues.completed.length,
      color: 'neutral'
    }
  ];

  const currentQueueData = studentsData.queues[activeTab] || [];

  return (
    <div className="student-queues-section">
      <div className="queues-header">
        <h2>Student Queues</h2>
        <p>Manage students across different learning states</p>
      </div>

      <div className="queues-tabs">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              className={`queue-tab ${activeTab === tab.key ? 'active' : ''} ${tab.color}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <IconComponent size={16} />
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div className="queues-content">
        {loading || loadingStudents ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            Loading students...
          </div>
        ) : currentQueueData.length === 0 ? (
          <div className="empty-queue">
            <div className="empty-icon">
              {tabs.find(t => t.key === activeTab)?.icon && 
                React.createElement(tabs.find(t => t.key === activeTab).icon, { size: 48 })
              }
            </div>
            <h3>No Students in {tabs.find(t => t.key === activeTab)?.label}</h3>
            <p>
              {activeTab === 'joinLiveNow' && 'No students are ready to join live sessions right now.'}
              {activeTab === 'backlogRecorded' && 'No students need to catch up on recorded content.'}
              {activeTab === 'completed' && 'No students have completed all subjects yet.'}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={currentQueueData}
            searchable={true}
            searchPlaceholder={`Search ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}...`}
            selectedRows={selectedStudents}
            onRowSelect={handleRowSelect}
            onRowClick={(student) => openStudentProfile(student)}
            emptyMessage={`No students found in ${tabs.find(t => t.key === activeTab)?.label}`}
            className="students-table"
          />
        )}
      </div>

      {selectedStudents.length > 0 && (
        <div className="selection-summary">
          <span className="selection-count">
            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
          </span>
          <button
            className="clear-selection-btn"
            onClick={() => onStudentSelect && onStudentSelect([])}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentQueues;
