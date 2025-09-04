import React from 'react';
import './liveClasses.css';

const Filters = ({ courses, filters, onChange, onSearch }) => {
  return (
    <div className="lc-filters">
      <select className="lc-filter" aria-label="Course filter" value={filters.courseId || ''} onChange={(e)=>onChange({ ...filters, courseId: e.target.value || undefined })}>
        <option value="">All Courses</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <input className="lc-filter" aria-label="From date" type="date" value={filters.from || ''} onChange={(e)=>onChange({ ...filters, from: e.target.value })} />
      <input className="lc-filter" aria-label="To date" type="date" value={filters.to || ''} onChange={(e)=>onChange({ ...filters, to: e.target.value })} />
      <select className="lc-filter" aria-label="Status filter" value={filters.status || ''} onChange={(e)=>onChange({ ...filters, status: e.target.value || undefined })}>
        <option value="">All Status</option>
        <option value="scheduled">Scheduled</option>
        <option value="live">Live</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input className="lc-filter" aria-label="Search" placeholder="Search" value={filters.q || ''} onChange={(e)=>onChange({ ...filters, q: e.target.value })} onKeyDown={(e)=>{ if(e.key==='Enter') onSearch(); }} />
      <div className="lc-actions">
        <button className="lc-btn" onClick={()=>onChange({})}>Reset</button>
        <button className="lc-btn primary" onClick={onSearch}>Apply</button>
      </div>
    </div>
  );
};

export default Filters;
