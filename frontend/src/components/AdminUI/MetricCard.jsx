import React from 'react';
import Card from './Card';

const MetricCard = ({ icon, title, value }) => (
  <Card>
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <div>
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value ?? '—'}</div>
      </div>
    </div>
  </Card>
);

export default MetricCard;
