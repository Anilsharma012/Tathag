import React, { useEffect, useState } from 'react';
import './LeadCaptureModal.css';

const KEY = 'lead_modal_dismissed_at';
const HOURS_24 = 24 * 60 * 60 * 1000;

const LeadCaptureModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const ts = Number(localStorage.getItem(KEY) || 0);
      if (!ts || Date.now() - ts > HOURS_24) setOpen(true);
    } catch { setOpen(true); }
  }, []);

  const close = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="lead-modal-overlay" role="dialog" aria-modal="true">
      <div className="lead-modal">
        <div className="lead-modal-header">
          <h3>Quick Inquiry</h3>
          <button className="lead-close" onClick={close} aria-label="Close">×</button>
        </div>
        <div className="lead-modal-body">
          <div className="lead-iframe-wrap">
            <iframe title="Lead Form" src="https://docs.google.com/forms/d/e/1FAIpQLSdMo-Gq1TmzLDpb0q3BUl1UwPssL60szasR2bVPMC8QPmSwgQ/viewform?embedded=true" width="100%" height="100%" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureModal;
