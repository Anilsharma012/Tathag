import React, { useState } from 'react';
import { FiInfo, FiPlay, FiVideo } from 'react-icons/fi';
import SubjectChip, { StatusChip } from '../../../../components/shared/SubjectChip/SubjectChip';
import './CourseSubjectMatrix.css';

const CourseSubjectMatrix = ({ 
  matrix = [], 
  loading = false, 
  onCourseClick = null,
  onCellAction = null 
}) => {
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const showTooltip = (event, cellData) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setTooltipData(cellData);
  };

  const hideTooltip = () => {
    setTooltipData(null);
  };

  const getStatusInfo = (cell) => {
    const { done, pending, total } = cell;
    
    if (total === 0) {
      return { status: 'pending', label: 'No Students' };
    }
    
    if (done === total) {
      return { status: 'done', label: 'Completed' };
    }
    
    if (done > 0) {
      return { status: 'in-progress', label: 'In Progress' };
    }
    
    return { status: 'pending', label: 'Not Started' };
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleCellClick = (courseId, subject, action = 'toggle') => {
    if (onCellAction) {
      onCellAction(courseId, subject, action);
    }
  };

  if (loading) {
    return (
      <div className="matrix-section">
        <div className="matrix-header">
          <h2>Course-Subject Progress Matrix</h2>
          <p>Loading...</p>
        </div>
        <div className="matrix-container">
          <div className="matrix-skeleton">
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="matrix-skeleton-row">
                <div className="skeleton-course-name"></div>
                {[...Array(4)].map((_, colIndex) => (
                  <div key={colIndex} className="skeleton-cell"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (matrix.length === 0) {
    return (
      <div className="matrix-section">
        <div className="matrix-header">
          <h2>Course-Subject Progress Matrix</h2>
          <p>Track progress across all courses and subjects</p>
        </div>
        <div className="matrix-empty">
          <FiInfo size={48} />
          <h3>No Courses Found</h3>
          <p>Add courses to the selected batch to see progress matrix</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matrix-section">
      <div className="matrix-header">
        <h2>Course-Subject Progress Matrix</h2>
        <p>Track progress across all courses and subjects</p>
      </div>
      
      <div className="matrix-container">
        <div className="matrix-table">
          {/* Header Row */}
          <div className="matrix-header-row">
            <div className="matrix-cell matrix-course-header">Course</div>
            <div className="matrix-cell matrix-subject-header">
              <SubjectChip subject="A" size="small" />
            </div>
            <div className="matrix-cell matrix-subject-header">
              <SubjectChip subject="B" size="small" />
            </div>
            <div className="matrix-cell matrix-subject-header">
              <SubjectChip subject="C" size="small" />
            </div>
            <div className="matrix-cell matrix-subject-header">
              <SubjectChip subject="D" size="small" />
            </div>
          </div>

          {/* Data Rows */}
          {matrix.map((row) => (
            <div key={row.courseId} className="matrix-data-row">
              <div className="matrix-cell matrix-course-cell">
                <div 
                  className="course-name-wrapper"
                  onClick={() => onCourseClick && onCourseClick(row)}
                >
                  <div className="course-name">{row.courseName}</div>
                  <div className="course-meta">
                    Start: <SubjectChip subject={row.startSubject} size="small" />
                  </div>
                </div>
              </div>

              {['A', 'B', 'C', 'D'].map((subject) => {
                const cell = row.subjects[subject];
                const statusInfo = getStatusInfo(cell);
                
                return (
                  <div 
                    key={subject} 
                    className="matrix-cell matrix-status-cell"
                    onMouseEnter={(e) => showTooltip(e, {
                      course: row.courseName,
                      subject,
                      ...cell,
                      statusInfo
                    })}
                    onMouseLeave={hideTooltip}
                    onClick={() => handleCellClick(row.courseId, subject)}
                  >
                    <StatusChip 
                      status={statusInfo.status}
                      label={`${cell.done}/${cell.total}`}
                      size="small"
                    />
                    
                    {cell.lastSession && (
                      <div className="cell-actions">
                        {cell.lastSession.recordingUrl ? (
                          <button 
                            className="cell-action-btn"
                            title="View Recording"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(cell.lastSession.recordingUrl, '_blank');
                            }}
                          >
                            <FiVideo size={12} />
                          </button>
                        ) : (
                          <button 
                            className="cell-action-btn"
                            title="Live Session"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(row.courseId, subject, 'schedule');
                            }}
                          >
                            <FiPlay size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltipData && (
        <div 
          className="matrix-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="tooltip-header">
            <strong>{tooltipData.course}</strong> - Subject {tooltipData.subject}
          </div>
          <div className="tooltip-stats">
            <div>Done: {tooltipData.done} students</div>
            <div>Pending: {tooltipData.pending} students</div>
            <div>Total: {tooltipData.total} students</div>
          </div>
          {tooltipData.lastSession && (
            <div className="tooltip-session">
              <div>Last Session: {formatDate(tooltipData.lastSession.startAt)}</div>
              {tooltipData.lastSession.recordingUrl && (
                <div>Recording Available</div>
              )}
            </div>
          )}
          <div className="tooltip-status">
            Status: {tooltipData.statusInfo.label}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSubjectMatrix;
