import React from 'react';
import './SubjectChip.css';

const SubjectChip = ({ 
  subject, 
  status = 'default', 
  size = 'default',
  interactive = false,
  count = null,
  onClick,
  className = ''
}) => {
  const getSubjectLabel = (subject) => {
    const labels = {
      'A': 'Subject A',
      'B': 'Subject B', 
      'C': 'Subject C',
      'D': 'Subject D'
    };
    return labels[subject] || subject;
  };

  const chipProps = {
    className: `subject-chip subject-${subject?.toLowerCase()} status-${status} size-${size} ${interactive ? 'interactive' : ''} ${className}`,
    role: interactive ? 'button' : undefined,
    tabIndex: interactive ? 0 : undefined,
    onClick: interactive ? onClick : undefined,
    onKeyDown: interactive ? (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick) {
        e.preventDefault();
        onClick(e);
      }
    } : undefined
  };

  return (
    <span {...chipProps}>
      <span className="subject-chip-label">
        {subject}
      </span>
      {count !== null && (
        <span className="subject-chip-count">
          {count}
        </span>
      )}
    </span>
  );
};

// Status chip variant for progress states
export const StatusChip = ({ 
  status, 
  label = null,
  size = 'default',
  className = ''
}) => {
  const getStatusInfo = (status) => {
    const statuses = {
      'done': { label: 'Done', color: 'success' },
      'in-progress': { label: 'In Progress', color: 'warning' },
      'pending': { label: 'Pending', color: 'neutral' },
      'active': { label: 'Active', color: 'primary' },
      'expired': { label: 'Expired', color: 'danger' },
      'completed': { label: 'Completed', color: 'success' }
    };
    return statuses[status] || { label: status, color: 'neutral' };
  };

  const statusInfo = getStatusInfo(status);

  return (
    <span className={`status-chip status-${statusInfo.color} size-${size} ${className}`}>
      {label || statusInfo.label}
    </span>
  );
};

// Batch chip variant
export const BatchChip = ({ 
  batchName, 
  currentSubject,
  coursesCount = 0,
  onClick,
  active = false,
  className = ''
}) => {
  return (
    <div 
      className={`batch-chip ${active ? 'active' : ''} ${onClick ? 'interactive' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
    >
      <div className="batch-chip-header">
        <span className="batch-chip-name">{batchName}</span>
        <SubjectChip subject={currentSubject} size="small" />
      </div>
      <div className="batch-chip-meta">
        {coursesCount} course{coursesCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default SubjectChip;
