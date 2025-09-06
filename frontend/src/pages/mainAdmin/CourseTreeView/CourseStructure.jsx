import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./CourseStructure.css";
import ReactModal from "react-modal";

const CourseStructure = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    axios
      .get(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourse(res.data.course))
      .catch((err) => console.error("Failed to load course:", err));

    axios
      .get(`/api/subjects/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSubjects(res.data.subjects || []);
        if (res.data.subjects?.length > 0) setActiveSubject(res.data.subjects[0]._id);
      })
      .catch((err) => console.error("Failed to load subjects:", err));
  }, [courseId]);

  useEffect(() => {
    if (!activeSubject) return;
    axios
      .get(`/api/chapters/${activeSubject}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setChapters(res.data.chapters || []))
      .catch((err) => console.error("Failed to load chapters:", err));
  }, [activeSubject]);

  // Send to Next state
  const [pickOpen, setPickOpen] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [mode, setMode] = useState('MERGE');
  const [includeSectionalTests, setIncludeSectionalTests] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]);
  const [batchProgress, setBatchProgress] = useState({ processed: 0, total: 0 });
  const [lastSummary, setLastSummary] = useState(null);

  // Lock Manager state
  const [lockOpen, setLockOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [scope, setScope] = useState('subject');
  const [autoLock, setAutoLock] = useState(true);
  const [locks, setLocks] = useState({}); // key: itemId -> status
  const [lockModal, setLockModal] = useState({ open:false, item:null, scope:null });

  const loadBatches = async () => {
    try {
      const res = await axios.get(`/api/batches?courseId=${courseId}`, { headers:{ Authorization:`Bearer ${token}` } });
      setBatches(res.data.items||[]);
      if (!selectedBatch && (res.data.items||[]).length) setSelectedBatch(res.data.items[0]._id);
    } catch(e){ console.error('batches error', e); }
  };
  const loadLocks = async () => {
    if (!selectedBatch) return;
    try {
      const res = await axios.get(`/api/locks/state?courseId=${courseId}&batchId=${selectedBatch}`, { headers:{ Authorization:`Bearer ${token}` } });
      const map = {}; (res.data.states||[]).forEach(s=>{ map[String(s.itemId)] = s.status; });
      setLocks(map);
    } catch(e){ console.error('locks error', e); }
  };
  useEffect(()=>{ if (lockOpen) { loadBatches(); } }, [lockOpen]);
  useEffect(()=>{ loadLocks(); }, [selectedBatch]);

  const addStep = (t) => setProgress((p) => [...p, { t, at: Date.now() }]);
  const sleep = (ms) => new Promise(r=>setTimeout(r, ms));

  const loadCourses = async () => {
    try {
      const res = await axios.get('/api/courses', { headers:{ Authorization:`Bearer ${token}` } });
      const items = res.data.courses || res.data || [];
      setCoursesList(items.filter((c)=>c._id !== courseId));
    } catch (e) {
      console.error('Failed to load courses:', e);
    }
  };

  const filteredCourses = coursesList.filter(c => {
    const q = search.toLowerCase();
    return (c.name||c.title||'').toLowerCase().includes(q) || (c.slug||'').includes(q) || String(c.batchYear||'').includes(q);
  });

  const fetchWithRetry = async (fn, tries=3) => {
    let delay = 500;
    for (let i=0;i<tries;i++) {
      try { return await fn(); } catch(e){
        if (i===tries-1) throw e; if (!(e.response && e.response.status<500)) { await sleep(delay); delay*=3; continue; } await sleep(delay); delay*=3;
      }
    }
  };

  const startSend = async () => {
    if (!selectedTarget) return;
    setRunning(true); setProgress([]); setLastSummary(null); setBatchProgress({ processed: 0, total: 0 });
    addStep('1) Fetch source structure');
    try {
      await fetchWithRetry(()=>axios.get(`/api/courses/${courseId}/structure`,{headers:{Authorization:`Bearer ${token}`}}));
    } catch (e) { console.error(e); alert('Error fetching source'); setRunning(false); return; }

    addStep('2) Dry-run estimate');
    let dryRes; try {
      dryRes = await fetchWithRetry(()=>axios.post(`/api/courses/copy-structure?dryRun=1`,{ sourceCourseId: courseId, targetCourseId: selectedTarget._id, mode: String(mode||'MERGE').toLowerCase(), includeSectionalTests, plan:{ batchSize:50, retries:2 } },{headers:{Authorization:`Bearer ${token}`}}));
      const plan = dryRes?.data?.plan; if (plan) setBatchProgress({ processed: 0, total: plan.totalBatches||0 });
    } catch(e){ console.error(e); const msg = e?.response?.data?.message || e?.response?.data || e.message || 'Dry-run failed'; alert(msg); setRunning(false); return; }

    addStep('3) Copying in batches');
    let realRes; try {
      realRes = await fetchWithRetry(()=>axios.post(`/api/courses/copy-structure`,{ sourceCourseId: courseId, targetCourseId: selectedTarget._id, mode: String(mode||'MERGE').toLowerCase(), includeSectionalTests, plan:{ batchSize:50, retries:2 } },{headers:{Authorization:`Bearer ${token}`}}));
      if (realRes?.data?.batches) setBatchProgress(realRes.data.batches);
    } catch(e){ console.error(e); const msg = e?.response?.data?.message || e?.response?.data || e.message || 'Copy failed'; alert(msg); setRunning(false); return; }

    addStep('4) Final verify');
    try {
      const data = realRes?.data || {};
      const success = !!data.success;
      const copied = data.copied || {};
      const skipped = data.skipped || 0;
      const verify = data.verify || {};
      const errors = data.errors || [];
      setLastSummary({ success, copied, skipped, verify, errors, incomplete: data.incomplete });
      const okHash = verify && verify.matched;
      alert(`Copied ${copied.sections||0} sections, ${copied.lessons||0} lessons, ${copied.quizzes||0} quizzes. Skipped ${skipped}. Hash ${okHash?'matched ✔':'mismatch ✖'}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="tz-container">
        <div className="tz-heading-row">
          <h1 className="tz-heading">📚 {course?.name} - Structure</h1>
          <div style={{display:'flex',gap:8}}>
            <button className="tz-btn" onClick={()=>{ setLockOpen(true); }} disabled={running}>Lock Manager</button>
            <button className="tz-primary-btn" onClick={()=>{setPickOpen(true); loadCourses();}} disabled={running}>
              {running ? 'Sending...' : 'Send to Next'}
            </button>
          </div>
        </div>

        <div className="tz-subject-tabs">
          {subjects.map((sub) => (
            <button
              key={sub._id}
              onClick={() => setActiveSubject(sub._id)}
              className={`tz-subject-tab ${activeSubject === sub._id ? "active" : ""}`}
              onDoubleClick={()=> setLockModal({ open:true, item:{ id: sub._id, title: sub.name }, scope:'subject' })}
            >
              {sub.name}
              <span className={`tz-badge tz-badge-${locks[String(sub._id)]||'unlocked'}`}>{(locks[String(sub._id)]||'unlocked')}</span>
            </button>
          ))}
        </div>

        {chapters.length > 0 ? (
          <div className="tz-chapters-grid">
            {chapters.map((ch) => (
              <ChapterCard
                key={ch._id}
                chapter={ch}
                course={course}
                subject={subjects.find((s) => s._id === activeSubject)}
                locks={locks}
                onOpenLock={(itemScope,item)=> setLockModal({ open:true, item, scope: itemScope })}
              />
            ))}
          </div>
        ) : (
          <div className="tz-no-chapters">No chapters available for this subject.</div>
        )}

        {pickOpen && (
          <div className="tz-modal-overlay" onClick={()=>setPickOpen(false)}>
            <div className="tz-modal" onClick={(e)=>e.stopPropagation()}>
              <h3 className="tz-modal-title">Send structure to…</h3>
              <button className="tz-modal-close" onClick={()=>setPickOpen(false)}>❌</button>

              {!selectedTarget ? (
                <>
                  <input className="tz-input" placeholder="Search courses" value={search} onChange={(e)=>setSearch(e.target.value)} />
                  <div className="tz-course-list">
                    {filteredCourses.map(c => (
                      <div className="tz-course-row" key={c._id}>
                        <div>
                          <div className="tz-course-name">{c.name || c.title}</div>
                          <div className="tz-course-sub">{c.slug} {c.batchYear ? `• ${c.batchYear}`:''}</div>
                        </div>
                        <button className="tz-btn" onClick={()=>setSelectedTarget(c)}>Select</button>
                      </div>
                    ))}
                    {filteredCourses.length===0 && <div className="tz-empty">No courses</div>}
                  </div>
                </>
              ) : (
                <>
                  <div className="tz-confirm">
                    <div className="tz-row"><strong>Target:</strong> {selectedTarget.name || selectedTarget.title}</div>
                    <div className="tz-row">
                      <label><input type="radio" name="mode" value="MERGE" checked={mode==='MERGE'} onChange={()=>setMode('MERGE')} /> MERGE</label>
                      <label style={{marginLeft:12}}><input type="radio" name="mode" value="OVERWRITE" checked={mode==='OVERWRITE'} onChange={()=>setMode('OVERWRITE')} /> OVERWRITE</label>
                    </div>
                    <label className="tz-row"><input type="checkbox" checked={includeSectionalTests} onChange={(e)=>setIncludeSectionalTests(e.target.checked)} /> Include sectional tests</label>
                    <div className="tz-actions">
                      <button className="tz-btn" onClick={()=>setSelectedTarget(null)}>Back</button>
                      <button className="tz-primary-btn" disabled={running} onClick={startSend}>{running?'Sending…':'Send Now'}</button>
                    </div>
                  </div>
                  {(progress.length>0 || batchProgress.total>0) && (
                    <div className="tz-progress">
                      {batchProgress.total>0 && (
                        <div className="tz-progress-rows">
                          <div className="tz-progress-item">Batches: {batchProgress.processed}/{batchProgress.total}</div>
                          <div className="tz-progress-bar">
                            <div className="tz-progress-fill" style={{ width: `${batchProgress.total? Math.min(100, Math.round((batchProgress.processed/batchProgress.total)*100)) : 0}%` }} />
                          </div>
                        </div>
                      )}
                      {progress.map((p,i)=>(<div key={i} className="tz-progress-item">{p.t}</div>))}
                      {lastSummary && lastSummary.incomplete && (
                        <div className="tz-progress-actions">
                          <button className="tz-btn" onClick={startSend} disabled={running}>Resume</button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const ChapterCard = ({ chapter, course, subject, locks, onOpenLock }) => {
  const [topics, setTopics] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const token = localStorage.getItem("adminToken");

  const fetchTopics = () => {
    axios
      .get(`/api/topics/${chapter._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTopics(res.data.topics || []))
      .catch((err) => console.error("❌ Failed to load topics:", err));
  };

  const handleToggle = (e) => {
    setExpanded(e.target.open);
    if (!expanded) fetchTopics();
  };

  return (
    <details className="tz-chapter-card" onToggle={handleToggle}>
      <summary>{chapter.name}</summary>
      <div className="tz-chapter-content">
        <p className="tz-chapter-path">
          Under {course?.name} / {subject?.name}
        </p>

        {topics.length > 0 ? (
          <ul className="tz-topic-list">
            {topics.map((topic) => (
              <li key={topic._id} className="tz-topic-item">
                📗 {topic.name}
                <TestList topicId={topic._id} />
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "12px", color: "#888" }}>No topics found.</p>
        )}
      </div>
    </details>
  );
};

const TestList = ({ topicId }) => {
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    axios
      .get(`/api/tests/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTests(res.data.tests || []))
      .catch((err) => console.error("❌ Failed to load tests:", err));
  }, [topicId]);

  const openTest = async (testId) => {
    try {
      const res = await axios.get(`/api/questions/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data.questions || []);
      setSelectedTestId(testId);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
    }
  };

  return (
    <>
      <ul className="tz-test-list">
        {tests.map((test) => (
          <li
            key={test._id}
            className="tz-test-item"
            onClick={() => openTest(test._id)}
          >
            🧪 {test.title}
          </li>
        ))}
      </ul>

      {/* Modal View */}
      {showModal && (
        <div className="tz-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tz-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="tz-modal-title">🧪 Questions</h3>
            <button className="tz-modal-close" onClick={() => setShowModal(false)}>
              ❌
            </button>
            <div className="tz-question-scroll">
              {questions.length > 0 ? questions.map((q, idx) => {
                // Safety check for question object
                if (!q || !q._id) {
                  return (
                    <div key={`error-${idx}`} className="tz-question-block">
                      <div className="tz-question-text" style={{color: "#ff6b6b"}}>
                        ⚠️ Question data is malformed
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={q._id} className="tz-question-block">
                    <div className="tz-question-text">
                      <strong>Q{idx + 1}:</strong>{" "}
                      <span dangerouslySetInnerHTML={{ __html: q.questionText || "No question text" }} />
                    </div>
                    {q.image && <img src={`/uploads/${q.image}`} alt="question-img" className="tz-question-image" />}
                    <ul className="tz-options-list">
                      {q.options && typeof q.options === 'object' && !Array.isArray(q.options) ? (
                        // Handle new object-based options format {A: "text", B: "text", ...}
                        Object.entries(q.options).map(([key, value]) => (
                          <li
                            key={key}
                            className={`tz-option-item ${q.correctOption === key ? "correct" : ""}`}
                          >
                            {key}. <span dangerouslySetInnerHTML={{ __html: value || "No option text" }} />
                          </li>
                        ))
                      ) : q.options && Array.isArray(q.options) ? (
                        // Handle legacy array-based options format ["text1", "text2", ...]
                        q.options.map((opt, i) => (
                          <li
                            key={i}
                            className={`tz-option-item ${q.correctOptionIndex === i ? "correct" : ""}`}
                          >
                            {i + 1}. <span dangerouslySetInnerHTML={{ __html: opt || "No option text" }} />
                          </li>
                        ))
                      ) : (
                        <li className="tz-option-item">No options available</li>
                      )}
                    </ul>
                    {q.explanation && (
                      <div className="tz-explanation">
                        <strong>Explanation:</strong>{" "}
                        <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                      </div>
                    )}
                    {/* Debug info */}
                    <div style={{fontSize: "10px", color: "#888", marginTop: "5px"}}>
                      Difficulty: {q.difficulty || "N/A"} | Marks: {q.marks || "N/A"}
                    </div>
                  </div>
                );
              }) : (
                <div className="tz-no-questions">No questions found for this test.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseStructure;
