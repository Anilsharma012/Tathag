import React, { useEffect, useMemo, useState } from 'react';
import http from '../../../utils/http';
import { getCache, setCache, shouldRevalidate } from '../../../utils/liveClassesCache';
import '../../Student/Dashboard.css';

const scope = 'student-progress';

const StudentMyProgress = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(()=>{ hydrate(); }, []);

  const hydrate = async () => {
    const cached = getCache(scope);
    setItems(cached.items || []);
    if (shouldRevalidate(scope)) await refresh();
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const courses = await fetchStudentCourses();
      const withProgress = await Promise.all(courses.map(async (c)=>{
        const summary = await fetchCourseProgress(c._id).catch(()=>({ percent: 0 }));
        return { ...c, percent: Math.round(summary.percent || summary.overallProgress || 0) };
      }));
      setItems(withProgress);
      setCache(scope, withProgress, {});
      setOffline(false);
    } catch (e) {
      setOffline(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="lc-container">
      {offline && <div className="lc-banner">Offline — showing cached progress.</div>}
      <div className="lc-card-list">
        {items.map(c => (
          <div key={c._id} className="lc-card">
            <div className="lc-card-header"><div className="lc-title">{c.name}</div></div>
            <div className="lc-muted">{c.teacher?.name || ''}</div>
            <div className="progress-bar" style={{height:10,background:'#f1f5f9',borderRadius:6,marginTop:8}}>
              <div className="progress-fill" style={{width:`${c.percent||0}%`,height:'100%',background:'#2d8cff',borderRadius:6}}></div>
            </div>
            <div className="lc-card-actions"><a className="lc-btn primary" href={`/student/course/${c._id}`}>Resume</a></div>
          </div>
        ))}
      </div>
    </div>
  );
};

async function fetchStudentCourses(){
  try {
    const r = await http.get('/user/student/my-courses');
    const list = r.data?.enrolledCourses || r.data || [];
    return list.filter(x=>x.courseId).map(x=>({ _id: x.courseId._id || x.courseId, name: x.courseId.name || '-', teacher: x.courseId.teacher || null }));
  } catch {
    const r = await http.get('/dev-payment/my-courses');
    const list = r.data?.enrolledCourses || [];
    return list.filter(x=>x.courseId).map(x=>({ _id: x.courseId._id || x.courseId, name: x.courseId.name || '-', teacher: x.courseId.teacher || null }));
  }
}

async function fetchCourseProgress(courseId){
  try {
    const r = await http.get(`/progress/course/${courseId}/summary`);
    return { percent: r.data?.summary?.percent || r.data?.progress?.overallProgress || 0 };
  } catch {
    try { const r = await http.get(`/progress/course/${courseId}`); return { percent: r.data?.progress?.overallProgress || 0 }; } catch { return { percent: 0 }; }
  }
}

export default StudentMyProgress;
