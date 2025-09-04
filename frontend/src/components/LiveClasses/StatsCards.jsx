import React from 'react';
import './liveClasses.css';

const StatsCards = ({ stats }) => {
  const up = stats?.upcomingWeek || 0;
  const total = stats?.totalScheduled || 0;
  const by = stats?.byPlatform || {};
  return (
    <div className="lc-stats">
      <div className="lc-stat-card"><div className="lc-muted">Upcoming (7d)</div><div className="lc-stat-value">{up}</div></div>
      <div className="lc-stat-card"><div className="lc-muted">Total Scheduled</div><div className="lc-stat-value">{total}</div></div>
      <div className="lc-stat-card"><div className="lc-muted">By Platform</div>
        <div className="lc-badges-row">
          {Object.keys(by).length===0 && <span className="lc-muted">No data</span>}
          {Object.entries(by).map(([k,v]) => (
            <span key={k} className={`lc-badge ${k}`}>{k}: {v}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
