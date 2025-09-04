import React, { useEffect, useState } from 'react';
import './liveClasses.css';

const initial = {
  title: '', courseId: '', platform: 'zoom', joinLink: '', startTime: '', endTime: '', timezone: 'Asia/Kolkata', rrule: '', description: '', reminders: [1440, 60, 10]
};

const LiveClassForm = ({ courses, value, onCancel, onSubmit }) => {
  const [form, setForm] = useState(initial);
  const editing = !!(value && value._id);
  useEffect(()=>{ setForm(value ? {
    ...initial,
    ...value,
    courseId: value.courseId?._id || value.courseId || '',
    startTime: value.startTime ? toLocal(value.startTime) : '',
    endTime: value.endTime ? toLocal(value.endTime) : ''
  } : initial); }, [value]);

  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      reminders: form.reminders
    };
    if (form.platform === 'zoom' && !form.joinLink) {
      // Allow backend to auto-create Zoom meeting
    }
    onSubmit(payload);
  };

  return (
    <form className="lc-form" onSubmit={submit}>
      <h3 className="lc-section-title">Class Details</h3>
      <div className="full lc-field">
        <label htmlFor="lc-title">Title<span aria-hidden> *</span></label>
        <input id="lc-title" aria-label="Class title" placeholder="Enter class title" value={form.title} onChange={(e)=>change('title', e.target.value)} required />
      </div>
      <div className="lc-field">
        <label htmlFor="lc-course">Course<span aria-hidden> *</span></label>
        <select id="lc-course" aria-label="Select course" value={form.courseId} onChange={(e)=>change('courseId', e.target.value)} required>
          <option value="">Select</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <div className="lc-field">
        <label htmlFor="lc-platform">Platform</label>
        <select id="lc-platform" aria-label="Select platform" value={form.platform} onChange={(e)=>change('platform', e.target.value)}>
          <option value="zoom">Zoom</option>
          <option value="google_meet">Google Meet</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="full lc-field">
        <label htmlFor="lc-join">Join Link {form.platform !== 'zoom' ? '(required)' : '(auto or manual)'}</label>
        <input id="lc-join" aria-label="Join link" value={form.joinLink} onChange={(e)=>change('joinLink', e.target.value)} placeholder={form.platform==='zoom' ? 'Leave blank to auto-generate' : 'Paste the meeting link'} required={form.platform !== 'zoom'} />
        <div className="lc-help lc-muted">If Zoom is selected and left blank, a meeting link will be auto-created.</div>
      </div>

      <h3 className="lc-section-title">Schedule</h3>
      <div className="lc-field">
        <label htmlFor="lc-start">Start Time<span aria-hidden> *</span></label>
        <input id="lc-start" type="datetime-local" value={form.startTime} onChange={(e)=>change('startTime', e.target.value)} required />
      </div>
      <div className="lc-field">
        <label htmlFor="lc-end">End Time<span aria-hidden> *</span></label>
        <input id="lc-end" type="datetime-local" value={form.endTime} onChange={(e)=>change('endTime', e.target.value)} required />
        {(form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) && (
          <div className="lc-muted lc-error">End time must be after start time</div>
        )}
      </div>
      <div className="lc-field">
        <label htmlFor="lc-tz">Timezone</label>
        <input id="lc-tz" aria-label="Timezone" value={form.timezone} onChange={(e)=>change('timezone', e.target.value)} />
        <div className="lc-help lc-muted">Default: Asia/Kolkata</div>
      </div>
      <div className="lc-field">
        <label htmlFor="lc-rrule">Recurring (RRULE)</label>
        <input id="lc-rrule" aria-label="Recurring rule" value={form.rrule} onChange={(e)=>change('rrule', e.target.value)} placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE" />
        <div className="lc-help lc-muted">Leave empty for one-time class. Example: FREQ=DAILY;COUNT=5</div>
      </div>

      <h3 className="lc-section-title">Description & Reminders</h3>
      <div className="full lc-field">
        <label htmlFor="lc-desc">Description</label>
        <textarea id="lc-desc" aria-label="Class description" value={form.description} onChange={(e)=>change('description', e.target.value)} rows={3} placeholder="Optional notes for students" />
      </div>
      <div className="full lc-field">
        <label htmlFor="lc-reminders">Reminders (minutes before)</label>
        <input id="lc-reminders" aria-label="Reminder minutes" value={form.reminders.join(',')} onChange={(e)=>change('reminders', e.target.value.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>!isNaN(n)))} placeholder="1440, 60, 10" />
        <div className="lc-help lc-muted">Comma-separated. Sends reminders 1 day, 1 hour, and 10 minutes before.</div>
      </div>

      <div className="full lc-form-actions">
        <button type="button" className="lc-btn" onClick={onCancel} aria-label="Cancel create live class">Cancel</button>
        <button type="submit" className="lc-btn primary" aria-label={editing? 'Update live class' : 'Create live class'}>{editing? 'Update Live Class' : 'Create Live Class'}</button>
      </div>
    </form>
  );
};

const toLocal = (iso) => {
  const d = new Date(iso);
  const pad = (n) => (n<10?`0${n}`:n);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default LiveClassForm;
