import React, { useMemo, useState } from 'react';
import './liveClasses.css';

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const CalendarView = ({ items, onSelectItem }) => {
  const [ref, setRef] = useState(new Date());
  const first = useMemo(() => {
    const s = startOfMonth(ref);
    const offset = s.getDay();
    return addDays(s, -offset);
  }, [ref]);
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(first, i)), [first]);
  const eventsByDay = useMemo(() => {
    const map = {};
    items.forEach(it => {
      const key = new Date(it.startTime).toDateString();
      (map[key] = map[key] || []).push(it);
    });
    return map;
  }, [items]);

  const monthLabel = ref.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="lc-header">
        <div className="lc-actions">
          <button className="lc-btn" onClick={()=>setRef(new Date(ref.getFullYear(), ref.getMonth() - 1, 1))}>Prev</button>
          <div className="lc-badge">{monthLabel}</div>
          <button className="lc-btn" onClick={()=>setRef(new Date())}>Today</button>
          <button className="lc-btn" onClick={()=>setRef(new Date(ref.getFullYear(), ref.getMonth() + 1, 1))}>Next</button>
        </div>
      </div>
      <div className="lc-calendar">
        {days.map((d, i) => {
          const key = d.toDateString();
          const isOtherMonth = d.getMonth() !== ref.getMonth();
          return (
            <div key={i} className={`lc-cal-day ${isOtherMonth ? 'lc-day-muted' : ''}`}>
              <h4>{d.getDate()}</h4>
              {(eventsByDay[key] || []).map(ev => (
                <div key={ev._id} className={`lc-badge ${ev.platform}`} title={ev.title} onClick={()=> onSelectItem && onSelectItem(ev)}>
                  {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
