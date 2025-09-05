import React, { useEffect, useMemo, useState } from 'react';
import http from '../../../utils/http';
import './nextStep.css';

const SubjectChip = ({ s }) => <span className={`ns-chip ns-${s}`}>{s}</span>;

const SessionList = ({ items }) => (
  <ul className="ns-sessions">
    {items.map(it => (
      <li key={it.id} className="ns-session">
        <div>
          <div className="ns-time">{new Date(it.startAt).toLocaleString()} → {new Date(it.endAt).toLocaleTimeString()}</div>
          {it.recordingUrl && <a className="ns-link" href={it.recordingUrl} target="_blank" rel="noreferrer">Recording</a>}
        </div>
      </li>
    ))}
  </ul>
);

const Countdown = ({ start, end }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(()=>setNow(Date.now()), 1000); return ()=>clearInterval(t); }, []);
  const tms = useMemo(() => new Date(start).getTime() - now, [start, now]);
  if (now > new Date(end).getTime()) return <span className="ns-muted">ended</span>;
  if (tms <= 0) return <span className="ns-live">LIVE</span>;
  const s = Math.max(0, Math.floor(tms/1000));
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return <span className="ns-muted">starts in {h}h {m}m {sec}s</span>;
};

const NextStepCard = ({ courseId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await http.get('/student/next-step', { params: courseId ? { courseId } : {} });
      setData(data);
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); // eslint-disable-next-line
  }, [courseId]);

  if (loading) return <div className="ns-card">Loading…</div>;
  if (error) return <div className="ns-card ns-error">{error}</div>;
  if (!data || !data.success) return null;

  const canJoin = data.joinable && (data.sessions||[]).length>0;
  const sess = (data.sessions||[])[0];
  const withinJoinWindow = canJoin && (Date.now() >= (new Date(sess.startAt).getTime() - 10*60*1000)) && (Date.now() <= new Date(sess.endAt).getTime());

  // Derive course type (P/Q/R/S) from startSubject; default 'T'
  const map = { A: 'P', B: 'Q', C: 'R', D: 'S' };
  const courseType = map[data?.course?.startSubject] || 'T';
  const leftDays = (data?.validity?.leftDays != null)
    ? data.validity.leftDays
    : (() => {
        const vt = data?.enrollment?.validTill ? new Date(data.enrollment.validTill) : null;
        if (!vt) return null;
        return Math.max(0, Math.ceil((vt.getTime() - Date.now()) / (1000*60*60*24)));
      })();

  return (
    <div className="ns-card">
      <div className="ns-header">
        <div className="ns-title">Your Next Step</div>
        <div className="ns-chips">
          <span className="ns-badge">{data.course?.name}</span>
          <span className="ns-badge">Course {courseType}</span>
          {leftDays != null ? (
            <span className="ns-badge">{leftDays}d left</span>
          ) : (
            <span className="ns-badge">valid till {new Date(data.enrollment?.validTill).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      {canJoin ? (
        <div className="ns-cta">
          <div className="ns-cta-title">Join Live – Subject <SubjectChip s={data.nextSubject}/></div>
          <Countdown start={sess.startAt} end={sess.endAt}/>
          <a className={`ns-btn ${withinJoinWindow ? '' : 'ns-btn-disabled'}`} href={withinJoinWindow ? sess.joinUrl : undefined} onClick={(e)=>{ if (!withinJoinWindow) e.preventDefault(); }} target="_blank" rel="noreferrer">{withinJoinWindow ? 'Join Now' : 'Join window opens 10m before'}</a>
        </div>
      ) : (
        <div className="ns-cta">
          <div className="ns-cta-title">Watch Recorded – Subject <SubjectChip s={data.nextSubject||'-'}/></div>
          <SessionList items={data.sessions||[]}/>
          <div className="ns-muted">Backlog</div>
        </div>
      )}
    </div>
  );
};

export default NextStepCard;
