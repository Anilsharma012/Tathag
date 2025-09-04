import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import '../../../components/LiveClasses/liveClasses.css';
import http, { API_BASE } from '../../../utils/http';

// In-memory cache (persists while app is alive)
const MEM = {
  ocr: null,
  omr: null,
  reports: [],
};

const SS_KEYS = {
  ocr: 'ocr:lastResult:v1',
  omr: 'omr:lastResult:v1',
  reports: 'tests:reports:v1',
};

const AdminEvaluation = () => {
  const [activeTab, setActiveTab] = useState('ocr'); // 'ocr' | 'omr' | 'reports'

  // Banners
  const [ocrOffline, setOcrOffline] = useState(false);
  const [omrOffline, setOmrOffline] = useState(false);
  const [reportsOffline, setReportsOffline] = useState(false);

  // OCR state
  const [ocrTestId, setOcrTestId] = useState('');
  const [ocrStudentId, setOcrStudentId] = useState('');
  const [ocrStrictness, setOcrStrictness] = useState('medium'); // strict | medium | lenient
  const [ocrStatus, setOcrStatus] = useState('Pending'); // Pending | Processing | Done | Error
  const [ocrItems, setOcrItems] = useState([]);
  const [ocrSummary, setOcrSummary] = useState({ total: 0, accuracy: 0, timeTaken: 0 });
  const ocrInputRef = useRef(null);
  const [ocrBusy, setOcrBusy] = useState(false);

  // OMR state
  const [omrTestId, setOmrTestId] = useState('');
  const [omrTemplateId, setOmrTemplateId] = useState('A');
  const [omrThreshold, setOmrThreshold] = useState(0.6);
  const [omrTolerance, setOmrTolerance] = useState(4);
  const [omrRollRegion, setOmrRollRegion] = useState('');
  const [omrItems, setOmrItems] = useState([]);
  const [omrSummary, setOmrSummary] = useState({ total: 0, correct: 0, incorrect: 0, score: 0 });
  const omrInputRef = useRef(null);
  const [omrBusy, setOmrBusy] = useState(false);

  // Reports state
  const [filter, setFilter] = useState({ testId: '', studentId: '', status: 'All', from: '', to: '' });
  const [reports, setReports] = useState([]);
  const [reportsBusy, setReportsBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Once: rehydrate from sessionStorage then background fetch
  useEffect(() => {
    try {
      const sOcr = JSON.parse(sessionStorage.getItem(SS_KEYS.ocr) || 'null');
      const sOmr = JSON.parse(sessionStorage.getItem(SS_KEYS.omr) || 'null');
      const sRep = JSON.parse(sessionStorage.getItem(SS_KEYS.reports) || '[]');
      if (sOcr) { MEM.ocr = sOcr; paintOCR(sOcr); }
      if (sOmr) { MEM.omr = sOmr; paintOMR(sOmr); }
      if (Array.isArray(sRep)) { MEM.reports = sRep; setReports(sRep); }
    } catch {}

    // soft refresh recent reports
    softFetchRecent();
  }, []);

  const softFetchRecent = async () => {
    try {
      const r = await http.get('/tests/reports', { params: { role: 'admin', recent: 1 } });
      const items = r.data?.items || [];
      MEM.reports = items;
      try { sessionStorage.setItem(SS_KEYS.reports, JSON.stringify(items)); } catch {}
      setReports(items);
      setReportsOffline(false);
    } catch {
      setReportsOffline(true);
    }
  };

  // Helpers: painters from cached payloads
  const paintOCR = (payload) => {
    setOcrItems(payload.items || []);
    setOcrSummary({ total: payload.total || 0, accuracy: payload.accuracy || 0, timeTaken: payload.timeTaken || 0 });
    setOcrStatus('Done');
  };
  const paintOMR = (payload) => {
    setOmrItems(payload.items || []);
    setOmrSummary({ total: payload.total || 0, correct: payload.correct || 0, incorrect: payload.incorrect || 0, score: payload.score || 0 });
  };

  // OCR evaluate
  const onOcrEvaluate = async () => {
    if (!ocrTestId || !ocrStudentId) { alert('Select test and student'); return; }
    const file = ocrInputRef.current?.files?.[0];
    if (!file) { alert('Select a file'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('Max 20MB'); return; }
    if (!/pdf|jpg|jpeg|png$/i.test(file.name)) { alert('Only jpg, png, pdf allowed'); return; }
    setOcrBusy(true);
    setOcrStatus('Processing');
    const form = new FormData();
    form.append('testId', ocrTestId);
    form.append('studentId', ocrStudentId);
    form.append('file', file);
    form.append('strictness', ocrStrictness);
    try {
      const r = await http.post('/evaluation/ocr/extract', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = r.data || {};
      const payload = {
        items: Array.isArray(data.items) ? data.items : [],
        total: data.total || 0,
        accuracy: data.accuracy || 0,
        timeTaken: data.timeTaken || 0,
        testId: ocrTestId,
        studentId: ocrStudentId,
        strictness: ocrStrictness,
      };
      MEM.ocr = payload; try { sessionStorage.setItem(SS_KEYS.ocr, JSON.stringify(payload)); } catch {}
      setOcrOffline(false);
      paintOCR(payload);
    } catch (e) {
      setOcrOffline(true);
      setOcrStatus('Error');
    } finally {
      setOcrBusy(false);
    }
  };

  // OCR save
  const onOcrSave = async () => {
    if (!MEM.ocr) { alert('No result to save'); return; }
    try {
      const r = await http.post('/evaluation/ocr/save', {
        testId: ocrTestId,
        studentId: ocrStudentId,
        result: MEM.ocr,
      });
      const reportId = r.data?.reportId;
      if (reportId) {
        // optimistic add to reports
        const entry = {
          _id: reportId,
          reportId,
          type: 'OCR',
          testId: ocrTestId,
          studentId: ocrStudentId,
          score: MEM.ocr.total || 0,
          accuracy: MEM.ocr.accuracy || 0,
          date: new Date().toISOString(),
        };
        const next = [entry, ...MEM.reports];
        MEM.reports = next; setReports(next);
        try { sessionStorage.setItem(SS_KEYS.reports, JSON.stringify(next)); } catch {}
        alert('Saved');
      }
    } catch { alert('Failed to save'); }
  };

  // OMR check
  const onOmrCheck = async () => {
    if (!omrTestId) { alert('Select test'); return; }
    const file = omrInputRef.current?.files?.[0];
    if (!file) { alert('Select a file'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('Max 20MB'); return; }
    if (!/pdf|jpg|jpeg|png$/i.test(file.name)) { alert('Only jpg, png, pdf allowed'); return; }
    setOmrBusy(true);
    const form = new FormData();
    form.append('testId', omrTestId);
    form.append('templateId', omrTemplateId);
    form.append('file', file);
    form.append('options', JSON.stringify({ threshold: Number(omrThreshold), tolerance: Number(omrTolerance), rollRegion: omrRollRegion }));
    try {
      const r = await http.post('/evaluation/omr/check', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = r.data || {};
      const payload = {
        items: Array.isArray(data.items) ? data.items : [],
        correct: data.correct || 0,
        incorrect: data.incorrect || 0,
        total: data.total || 0,
        score: data.score || 0,
        testId: omrTestId,
      };
      MEM.omr = payload; try { sessionStorage.setItem(SS_KEYS.omr, JSON.stringify(payload)); } catch {}
      setOmrOffline(false);
      paintOMR(payload);
    } catch (e) {
      setOmrOffline(true);
    } finally {
      setOmrBusy(false);
    }
  };

  // OMR save
  const onOmrSave = async () => {
    if (!MEM.omr) { alert('No result to save'); return; }
    try {
      const r = await http.post('/evaluation/omr/save', {
        testId: omrTestId,
        studentId: filter.studentId || '',
        result: MEM.omr,
      });
      const reportId = r.data?.reportId;
      if (reportId) {
        const entry = {
          _id: reportId,
          reportId,
          type: 'OMR',
          testId: omrTestId,
          studentId: filter.studentId || '',
          score: MEM.omr.score || 0,
          accuracy: Math.round(((MEM.omr.correct || 0) / Math.max(1, MEM.omr.total || 1)) * 100),
          date: new Date().toISOString(),
        };
        const next = [entry, ...MEM.reports];
        MEM.reports = next; setReports(next);
        try { sessionStorage.setItem(SS_KEYS.reports, JSON.stringify(next)); } catch {}
        alert('Saved');
      }
    } catch { alert('Failed to save'); }
  };

  const downloadPdf = async (reportId, testId = 'report', studentId = 'student') => {
    try {
      const r = await http.get(`/tests/reports/${reportId}/pdf`, { responseType: 'blob' });
      const blob = r.data instanceof Blob ? r.data : new Blob([r.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${testId}-${studentId}.pdf`;
      document.body.appendChild(a); a.click();
      setTimeout(()=>{ window.URL.revokeObjectURL(url); document.body.removeChild(a); }, 0);
    } catch (e) {
      try {
        // Some APIs return JSON with { url }
        const j = await http.get(`/tests/reports/${reportId}/pdf`);
        if (j.data?.url) window.open(j.data.url, '_blank'); else throw new Error('no url');
      } catch { alert('Failed to download'); }
    }
  };

  // Fixed UI tree: render all tabs, toggle visibility only
  return (
    <AdminLayout>
      <div className="lc-container">
        {(ocrOffline || omrOffline || reportsOffline) && (
          <div className="lc-banner">Offline/cache view</div>
        )}

        {/* Tabs */}
        <div className="lc-card">
          <div className="lc-header" style={{ marginBottom: 8 }}>
            <div className="lc-title">Evaluation</div>
            <div className="lc-actions" style={{ display: 'flex', gap: 8 }}>
              <button className={`lc-btn ${activeTab==='ocr'?'active':''}`} onClick={()=>setActiveTab('ocr')}>OCR</button>
              <button className={`lc-btn ${activeTab==='omr'?'active':''}`} onClick={()=>setActiveTab('omr')}>OMR</button>
              <button className={`lc-btn ${activeTab==='reports'?'active':''}`} onClick={()=>setActiveTab('reports')}>Reports</button>
          </div>
          </div>
        </div>

        {/* OCR Panel */}
        <div className="lc-section" style={{ display: activeTab==='ocr' ? 'block' : 'none' }}>
          <div className="lc-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
            <div className="lc-card">
              <div className="lc-title">Handwritten OCR — Upload</div>
              <div className="lc-field"><label>Test</label><input value={ocrTestId} onChange={e=>setOcrTestId(e.target.value)} placeholder="testId" /></div>
              <div className="lc-field"><label>Student</label><input value={ocrStudentId} onChange={e=>setOcrStudentId(e.target.value)} placeholder="studentId or email" /></div>
              <div className="lc-field"><label>File</label><input type="file" ref={ocrInputRef} accept=".jpg,.jpeg,.png,.pdf" /></div>
              <div className="lc-field"><label>Strictness</label>
                <select value={ocrStrictness} onChange={e=>setOcrStrictness(e.target.value)}>
                  <option value="strict">Strict</option>
                  <option value="medium">Medium</option>
                  <option value="lenient">Lenient</option>
                </select>
              </div>
              <button className="lc-btn" onClick={onOcrEvaluate} disabled={ocrBusy}>{ocrBusy ? 'Processing...' : 'Extract & Evaluate'}</button>
            </div>

            <div className="lc-card">
              <div className="lc-title">Result</div>
              <div className="lc-muted" style={{ marginBottom: 8 }}>Status: {ocrStatus}</div>
              <table className="lc-table">
                <thead><tr><th>Question</th><th>Extracted Answer</th><th>Keywords</th><th>Score/Max</th><th>Verdict</th></tr></thead>
                <tbody>
                  {ocrItems.map((it, idx)=> (
                    <tr key={idx}>
                      <td>{it.qNo}</td>
                      <td style={{whiteSpace:'pre-wrap'}}>{it.extractedText}</td>
                      <td>{Array.isArray(it.keywordsHit) ? it.keywordsHit.join(', ') : ''}</td>
                      <td>{it.score}/{it.max}</td>
                      <td>{it.verdict ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="lc-section" style={{ display:'flex', gap: 16 }}>
                <div>Total Score: <b>{ocrSummary.total}</b></div>
                <div>Accuracy: <b>{ocrSummary.accuracy}%</b></div>
                <div>Time Taken: <b>{ocrSummary.timeTaken}s</b></div>
              </div>
              <div className="lc-actions" style={{ display:'flex', gap: 8 }}>
                <button className="lc-btn" onClick={onOcrSave}>Save Result</button>
              </div>
            </div>
          </div>
        </div>

        {/* OMR Panel */}
        <div className="lc-section" style={{ display: activeTab==='omr' ? 'block' : 'none' }}>
          <div className="lc-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
            <div className="lc-card">
              <div className="lc-title">OMR — Upload</div>
              <div className="lc-field"><label>Test</label><input value={omrTestId} onChange={e=>setOmrTestId(e.target.value)} placeholder="testId" /></div>
              <div className="lc-field"><label>Template</label>
                <select value={omrTemplateId} onChange={e=>setOmrTemplateId(e.target.value)}>
                  <option value="A">Template A</option>
                  <option value="B">Template B</option>
                </select>
              </div>
              <div className="lc-field"><label>File</label><input type="file" ref={omrInputRef} accept=".jpg,.jpeg,.png,.pdf" /></div>
              <div className="lc-field"><label>Darkness threshold</label><input type="number" step="0.1" min="0" max="1" value={omrThreshold} onChange={e=>setOmrThreshold(e.target.value)} /></div>
              <div className="lc-field"><label>Bubble tolerance (px)</label><input type="number" min="2" max="6" value={omrTolerance} onChange={e=>setOmrTolerance(e.target.value)} /></div>
              <div className="lc-field"><label>Roll No mapping region</label><input value={omrRollRegion} onChange={e=>setOmrRollRegion(e.target.value)} placeholder="x,y,w,h or JSON" /></div>
              <button className="lc-btn" onClick={onOmrCheck} disabled={omrBusy}>{omrBusy ? 'Checking...' : 'Auto-Check'}</button>
            </div>

            <div className="lc-card">
              <div className="lc-title">Result</div>
              <table className="lc-table">
                <thead><tr><th>Q#</th><th>Marked</th><th>Correct</th><th>Verdict</th></tr></thead>
                <tbody>
                  {omrItems.map((it, idx)=> (
                    <tr key={idx}>
                      <td>{it.qNo}</td>
                      <td>{it.marked ?? ''}</td>
                      <td>{it.correct ?? ''}</td>
                      <td>{it.verdict ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="lc-section" style={{ display:'flex', gap: 16 }}>
                <div>Total Questions: <b>{omrSummary.total}</b></div>
                <div>Correct: <b>{omrSummary.correct}</b></div>
                <div>Incorrect: <b>{omrSummary.incorrect}</b></div>
                <div>Score: <b>{omrSummary.score}</b></div>
              </div>
              <div className="lc-actions" style={{ display:'flex', gap: 8 }}>
                <button className="lc-btn" onClick={onOmrSave}>Save Result</button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Panel */}
        <div className="lc-section" style={{ display: activeTab==='reports' ? 'block' : 'none' }}>
          <div className="lc-card">
            <div className="lc-header" style={{ alignItems:'flex-end', gap: 12 }}>
              <div className="lc-title">Reports</div>
              <div className="lc-actions" style={{ display:'grid', gridTemplateColumns:'repeat(6, minmax(0,1fr))', gap:8, width:'100%' }}>
                <input placeholder="Test" value={filter.testId} onChange={e=>setFilter({...filter, testId:e.target.value})} />
                <input placeholder="Student" value={filter.studentId} onChange={e=>setFilter({...filter, studentId:e.target.value})} />
                <input type="date" value={filter.from} onChange={e=>setFilter({...filter, from:e.target.value})} />
                <input type="date" value={filter.to} onChange={e=>setFilter({...filter, to:e.target.value})} />
                <select value={filter.status} onChange={e=>setFilter({...filter, status:e.target.value})}>
                  <option>All</option>
                  <option>Passed</option>
                  <option>Failed</option>
                </select>
                <button className="lc-btn" onClick={async()=>{
                  setReportsBusy(true);
                  try {
                    const r = await http.get('/tests/reports', { params: {
                      role: 'admin', testId: filter.testId, studentId: filter.studentId, from: filter.from, to: filter.to,
                      status: filter.status && filter.status !== 'All' ? filter.status : ''
                    }});
                    const items = r.data?.items || [];
                    MEM.reports = items; setReports(items);
                    try { sessionStorage.setItem(SS_KEYS.reports, JSON.stringify(items)); } catch {}
                    setReportsOffline(false);
                  } catch { setReportsOffline(true); }
                  finally { setReportsBusy(false); }
                }}>Apply</button>
              </div>
            </div>
            <table className="lc-table">
              <thead><tr><th>Test</th><th>Type</th><th>Date</th><th>Score</th><th>/100</th><th>Accuracy %</th><th>Actions</th></tr></thead>
              <tbody>
                {reports.map((it,idx)=> (
                  <tr key={idx}>
                    <td>{it.testName || it.testId}</td>
                    <td>{it.type}</td>
                    <td>{new Date(it.date || Date.now()).toLocaleString()}</td>
                    <td>{it.score}</td>
                    <td>100</td>
                    <td>{it.accuracy}</td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <button className="lc-btn" onClick={()=>{ setSelectedReport(it); setDrawerOpen(true); }}>View</button>
                        <button className="lc-btn" onClick={()=> downloadPdf(it._id || it.reportId, it.testId || 'test', it.studentId || 'student')}>PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Drawer */}
          <div style={{ position:'fixed', top:0, right:0, width: drawerOpen? 420:0, transition:'width .2s ease', height:'100vh', background:'#fff', boxShadow:'-2px 0 12px rgba(0,0,0,.1)', overflow:'hidden', zIndex: 50 }}>
            <div style={{ padding:16, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between' }}>
              <div className="lc-title">Report Detail</div>
              <button className="lc-btn" onClick={()=> setDrawerOpen(false)}>Close</button>
            </div>
            <div style={{ padding:16 }}>
              {selectedReport ? (
                <div style={{ display:'grid', gap:8 }}>
                  <div><b>Test:</b> {selectedReport.testName || selectedReport.testId}</div>
                  <div><b>Type:</b> {selectedReport.type}</div>
                  <div><b>Date:</b> {new Date(selectedReport.date || Date.now()).toLocaleString()}</div>
                  <div><b>Score:</b> {selectedReport.score}</div>
                  <div><b>Accuracy:</b> {selectedReport.accuracy}%</div>
                  <div><b>Student:</b> {selectedReport.studentId || '-'}</div>
                </div>
              ) : (
                <div className="lc-muted">Select a report</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEvaluation;
