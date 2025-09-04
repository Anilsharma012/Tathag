import React from 'react';
import './StatusCard.css';

const StatusCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'default',
  loading = false,
  trend = null,
  onClick,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`status-card status-card-loading ${className}`}>
        <div className="status-card-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-value"></div>
            <div className="skeleton-subtitle"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`status-card status-card-${variant} ${onClick ? 'status-card-clickable' : ''} ${className}`}
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
      <div className="status-card-content">
        {Icon && (
          <div className="status-card-icon">
            <Icon />
          </div>
        )}
        
        <div className="status-card-info">
          <h3 className="status-card-title">{title}</h3>
          <div className="status-card-value">
            {value}
            {trend && (
              <span className={`status-card-trend trend-${trend.direction}`}>
                {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="status-card-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
