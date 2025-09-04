import React, { useState } from 'react';
import Drawer from './Drawer';

const actions = [
  { key: 'course', label: 'Add Course' },
  { key: 'subjects', label: 'Manage Subjects' },
  { key: 'class', label: 'Schedule Class' },
  { key: 'invoice', label: 'Create Invoice' },
  { key: 'announce', label: 'Announcement' },
];

const QuickActionsBar = () => {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div className="quick-actions">
        {actions.map(a => (
          <button key={a.key} className="qa-btn" onClick={() => setOpen(a.key)}>{a.label}</button>
        ))}
      </div>
      {actions.map(a => (
        <Drawer key={a.key} open={open===a.key} onClose={()=>setOpen(null)} title={a.label}>
          <div style={{display:'grid', gap:12}}>
            <input type="text" placeholder="Title" />
            <textarea placeholder="Details" rows={4} />
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button className="btn-outline" onClick={()=>setOpen(null)}>Cancel</button>
              <button className="btn-primary" onClick={()=>setOpen(null)}>Save</button>
            </div>
          </div>
        </Drawer>
      ))}
    </div>
  );
};

export default QuickActionsBar;
