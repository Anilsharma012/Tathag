import React from 'react';
import './admin-ui.css';

const Card = ({ className = '', children, onClick, role = 'region', ariaLabel }) => (
  <section className={`admin-card ${className}`} onClick={onClick} role={role} aria-label={ariaLabel}>
    {children}
  </section>
);

export default Card;
