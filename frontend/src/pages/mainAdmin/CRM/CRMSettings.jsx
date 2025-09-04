import React from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import './crm.css';

const CRMSettings = () => {
  return (
    <AdminLayout>
      <div className="crm-container">
        <div className="crm-header"><h1>CRM Settings</h1></div>
        <div className="settings-grid">
          <div className="card">
            <h3>Lead Sources</h3>
            <p>Manage common lead sources used in forms and filters.</p>
          </div>
          <div className="card">
            <h3>Stages</h3>
            <p>Stages are predefined for this CRM: New, Contacted, Demo Scheduled, Negotiation, Won, Lost.</p>
          </div>
          <div className="card">
            <h3>Notifications</h3>
            <p>Configure email notifications for invoice events and follow-ups.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CRMSettings;
