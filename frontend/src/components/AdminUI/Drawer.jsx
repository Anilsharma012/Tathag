import React from 'react';
import './admin-ui.css';

const Drawer = ({ open, onClose, title, children, footer }) => (
  <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
    <div className="drawer-header">
      <strong>{title}</strong>
      <button className="btn-outline" onClick={onClose}>Close</button>
    </div>
    <div className="drawer-body">
      {children}
    </div>
    {footer}
  </div>
);

export default Drawer;
