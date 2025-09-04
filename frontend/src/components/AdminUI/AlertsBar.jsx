import React from 'react';

const AlertsBar = ({ pendingInvoices = 0, expiringEnrollments = 0 }) => {
  const items = [];
  if (pendingInvoices > 0) items.push({ label: `${pendingInvoices} Pending Invoices`, kind: 'warning' });
  if (expiringEnrollments > 0) items.push({ label: `${expiringEnrollments} Enrollments expiring in 30d`, kind: 'danger' });
  if (items.length === 0) return null;
  return (
    <div className="alerts-bar">
      {items.map((it, i) => (
        <span key={i} className={`admin-chip ${it.kind}`}>{it.label}</span>
      ))}
    </div>
  );
};

export default AlertsBar;
