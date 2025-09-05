import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import './ViewCourse.css';

const cacheKey = (courseId, batchId) => `viewCourse:${courseId}:${batchId}`;

const ViewCourse = () => {
  const { courseId, batchId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef(null);

  const isAdmin = !!localStorage.getItem('adminToken');

  const computeCountdown = (iso) => {
    if (!iso) return '';
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / (24*60*60*1000));
    const h = Math.floor((diff % (24*60*60*1000)) / (60*60*1000));
    const m = Math.floor((diff % (60*60*1000)) / (60*1000));
    const s = Math.floor((diff % (60*1000)) / 1000);
    if (diff === 0) return '';
    return `${d>0?d+'d ':''}${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  const startCountdown = (iso) => {
    clearInterval(timerRef.current);
    if (!iso) return;
    timerRef.current = setInterval(() => {
      setCountdown(computeCountdown(iso));
    }, 1000);
    setCountdown(computeCountdown(iso));
  };

  useEffect(() => {
    // show cached
    try {
      const raw = localStorage.getItem(cacheKey(courseId, batchId));
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(parsed);
        setLoading(false);
        if (parsed.nextOpenAt) startCountdown(parsed.nextOpenAt);
      }
    } catch {}

    // revalidate
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/courses/${courseId}/batches/${batchId}/view`);
        if (res.data && res.data.success) {
          setData(res.data);
          localStorage.setItem(cacheKey(courseId, batchId), JSON.stringify(res.data));
          if (res.data.nextOpenAt) startCountdown(res.data.nextOpenAt);
        } else {
          setError('Failed to load');
        }
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => clearInterval(timerRef.current);
  }, [courseId, batchId]);

  const handleOpen = (subjectId) => {
    // Navigate to existing student course content route with subjectId as query
    navigate(`/student/course-content/${courseId}?subjectId=${subjectId}`);
  };

  const handleSetActive = async () => {
    if (!selectedSubjectId) return;
    try {
      await axios.patch(`/api/admin/batches/${batchId}/active-subject`, { subjectId: selectedSubjectId });
      // Refetch view to reflect change
      const res = await axios.get(`/api/courses/${courseId}/batches/${batchId}/view`);
      if (res.data?.success) {
        setData(res.data);
        localStorage.setItem(cacheKey(courseId, batchId), JSON.stringify(res.data));
        if (res.data.nextOpenAt) startCountdown(res.data.nextOpenAt);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  if (loading && !data) return <div className="vc-container"><div className="vc-loading">Loading...</div></div>;
  if (error) return <div className="vc-container"><div className="vc-error">{error}</div></div>;
  if (!data) return null;

  const { subjects = [], course, batch, nextOpenAt } = data;

  return (
    <div className="vc-container">
      <div className="vc-header">
        <h2 className="vc-title">{course?.title || course?.name} — {batch?.name}</h2>
        {nextOpenAt && countdown && (
          <div className="vc-countdown">
            Next unlock in: <span className="vc-countdown-time">{countdown}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="vc-admin-panel">
          <select className="vc-select" value={selectedSubjectId} onChange={(e)=>setSelectedSubjectId(e.target.value)}>
            <option value="">Select subject</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.order != null ? `${s.order}. `:''}{s.name}</option>
            ))}
          </select>
          <button className="vc-button" onClick={handleSetActive} disabled={!selectedSubjectId}>Set Active</button>
        </div>
      )}

      <div className="vc-grid">
        {subjects.map((s) => (
          <div key={s._id} className={`vc-card ${s.isUnlocked ? 'vc-card-open' : 'vc-card-locked'}`} onClick={() => s.isUnlocked && handleOpen(s._id)}>
            {!s.isUnlocked && (
              <div className="vc-lock-overlay" title="Locked until admin opens">
                <i className="fa-solid fa-lock vc-lock-icon" aria-hidden="true" />
              </div>
            )}
            <div className="vc-card-body">
              <div className="vc-card-title">{s.name}</div>
              <div className="vc-badges">
                {s.isUnlocked && <span className="vc-badge vc-badge-primary">Open</span>}
                {s.status === 'completed' && <span className="vc-badge vc-badge-success">Completed</span>}
                {!s.isUnlocked && s.status === 'locked' && <span className="vc-badge vc-badge-muted">Locked</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewCourse;
