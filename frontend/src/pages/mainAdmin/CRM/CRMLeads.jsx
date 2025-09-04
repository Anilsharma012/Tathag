import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import crm from '../../../utils/crmApi';
import { API_BASE } from '../../../utils/apiBase';
import './crm.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const STAGES = ['New','Contacted','Demo Scheduled','Negotiation','Won','Lost'];
const CACHE_LEADS = 'crm:leads:v1';
const CACHE_INVS = 'crm:invoices:v1';

const formatINR = (v) => new Intl.NumberFormat('en-IN',{ style:'currency', currency:'INR' }).format(v);

const CRMLeads = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState({ search: '', stage: 'all', source: '', owner: '', from: '', to: '', hot: 'all', page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [banner, setBanner] = useState('');
  const [invoiceCache, setInvoiceCache] = useState({ summaries: {}, byLead: {} }); // summaries + per-lead lists
  const [summary, setSummary] = useState({ totals:{}, total:0, hot:0, cold:0, percentages:{} });
  const [pager, setPager] = useState({ page: 1, pages: 1, total: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null);
  const [activities, setActivities] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [invoiceDrawer, setInvoiceDrawer] = useState({ open:false, mode:'create', lead:null, invoice:null });
  const [rowSaving, setRowSaving] = useState('');

  // Rehydrate once
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CACHE_LEADS);
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(parsed.items || []);
        setQuery(prev => ({ ...prev, ...(parsed.query || {}) }));
      }
      const invs = sessionStorage.getItem(CACHE_INVS);
      if (invs) setInvoiceCache(JSON.parse(invs) || { summaries: {}, byLead: {} });
    } catch {}
    // Background refresh
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live summary polling
  useEffect(() => {
    let t = null;
    const fetchSummary = async () => { try { const s = await crm.get('/crm/leads/summary'); if (s.data?.success) setSummary(s.data); } catch {} };
    fetchSummary();
    t = setInterval(fetchSummary, 30000);
    return () => { if (t) clearInterval(t); };
  }, []);

  // Gentle auto-refresh to surface new webhook leads
  useEffect(() => {
    let t = setInterval(() => { fetchLeads(); }, 45000);
    return () => { clearInterval(t); };
  }, [query.stage, query.source, query.owner, query.from, query.to, query.hot, query.page, query.limit]);

  const saveCache = (list, q) => {
    sessionStorage.setItem(CACHE_LEADS, JSON.stringify({ items: list, query: q }));
  };
  const saveInvCache = (obj) => {
    sessionStorage.setItem(CACHE_INVS, JSON.stringify(obj));
  };

  const debounceRef = useRef(null);
  const applyFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const next = { ...query, page: 1 };
    setQuery(next);
    debounceRef.current = setTimeout(() => fetchLeads(next), 300);
  };

  const fetchLeads = async (overrideQ) => {
    const useQ = overrideQ || query;
    setLoading(true);
    setBanner('');
    try {
      const { data } = await crm.get('/crm/leads', { params: useQ });
      if (data.success) {
        setItems(data.items);
        setPager({ page: data.page || 1, pages: data.pages || 1, total: data.total || data.items.length || 0 });
        saveCache(data.items, useQ);
        try { const s = await crm.get('/crm/leads/summary'); if (s.data?.success) setSummary(s.data); } catch {}
        // fetch invoice summaries for current page
        const ids = data.items.map(x => x._id).join(',');
        if (ids) {
          try {
            const { data: s } = await crm.get('/crm/invoices/summary', { params: { leadIds: ids } });
            if (s.success) { const next = { summaries: s.summaries || {}, byLead: (invoiceCache.byLead||{}) }; setInvoiceCache(next); saveInvCache(next); }
          } catch {}
        }
      }
    } catch (e) {
      const hasCache = items.length > 0;
      if (hasCache) setBanner('Offline/cache view'); else toast.error(e.response?.data?.message || 'Failed to load leads');
    } finally { setLoading(false); }
  };

  const toggleAll = (checked) => {
    if (checked) setSelected(new Set(items.map(i => i._id)));
    else setSelected(new Set());
  };

  const toggleOne = (id) => {
    const copy = new Set(selected);
    if (copy.has(id)) copy.delete(id); else copy.add(id);
    setSelected(copy);
  };

  const bulk = async (action, payload) => {
    if (selected.size === 0) return toast.info('Select rows first');
    try {
      await crm.post('/crm/leads/bulk', { ids: Array.from(selected), action, payload });
      toast.success('Bulk action applied');
      setSelected(new Set());
      fetchLeads();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Bulk action failed');
    }
  };

  const exportCSV = () => {
    const headers = ['Name','Mobile','Email','Course','Source','Stage','Owner','Score','Last Activity','Next Follow-up','Tags'];
    const rows = items.map(l => [
      l.name, l.mobile, l.email || '', l.courseInterest || '', l.source || '', l.stage, l.owner || '', l.score || 0,
      l.lastActivity ? new Date(l.lastActivity).toISOString() : '',
      l.nextFollowUp ? new Date(l.nextFollowUp).toISOString() : '',
      (l.tags||[]).join('|')
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const openDrawer = async (leadId) => {
    setDrawerOpen(true); setActiveLead(leadId); setLeadDetail(null); setActivities([]); setInvoices([]); setActiveTab('Overview');
    try {
      const { data } = await crm.get(`/crm/leads/${leadId}`);
      if (data.success) {
        setLeadDetail(data.lead); setActivities(data.activities); setInvoices(data.invoices);
        const next = { summaries: { ...(invoiceCache.summaries||{}) }, byLead: { ...(invoiceCache.byLead||{}), [leadId]: data.invoices } };
        setInvoiceCache(next); saveInvCache(next);
        await trySyncInvoiceDrafts(leadId);
      }
    } catch { toast.error('Failed to load lead'); }
  };
  const closeDrawer = () => setDrawerOpen(false);

  const updateLeadInline = async (patch) => {
    if (!activeLead) return;
    try {
      const { data } = await crm.put(`/crm/leads/${activeLead}`, patch);
      if (data.success) { setLeadDetail(data.lead); toast.success('Updated'); fetchLeads(); }
    } catch { toast.error('Update failed'); }
  };

  const logActivity = async (payload) => {
    if (!activeLead) return;
    try {
      const { data } = await crm.post(`/crm/leads/${activeLead}/activities`, payload);
      if (data.success) { setActivities(prev => [data.activity, ...prev]); toast.success('Activity logged'); }
    } catch { toast.error('Failed to log'); }
  };

  const downloadPDF = (invId) => window.open(`${API_BASE}/crm/invoices/${invId}/pdf`, '_blank');
  const openInvoiceCreate = (leadId, leadObj) => {
    const lead = leadObj || items.find(i=>i._id===leadId);
    openInvoiceCreateHelper(setInvoiceDrawer, lead);
  };
  const openInvoiceView = async (leadId, invoiceId) => {
    const lead = items.find(i=>i._id===leadId);
    let invoice = null;
    try {
      const { data } = await crm.get('/crm/invoices', { params: { leadId } });
      if (data.success) invoice = (data.items||[]).find(x=>String(x._id)===String(invoiceId)) || (data.items||[])[0];
    } catch {}
    openInvoiceViewHelper(setInvoiceDrawer, lead, invoice);
  };

  const DRAFT_KEY = 'crm:invoices:draft';
  const readDrafts = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || []; } catch { return []; } };
  const writeDrafts = (arr) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(arr)); } catch {} };
  const trySyncInvoiceDrafts = async (leadId) => {
    const drafts = readDrafts(); if (!drafts.length) return;
    const remain = [];
    for (const d of drafts) {
      try {
        const { data } = await crm.post('/crm/invoices', { ...d.payload, leadId });
        if (data.success) {
          const created = data.invoice;
          setInvoices(prev => [created, ...prev.filter(x=>x._id!==d.id)]);
          const paid = created.amountPaid || 0; const total = created.total || 0;
          const st = paid >= total && total>0 ? 'Paid' : (paid>0 ? 'Partial' : 'Pending');
          const nextSummaries = { ...(invoiceCache.summaries||{}), [leadId]: { invoiceId: created._id, total, amountPaid: paid, status: st } };
          const next = { summaries: nextSummaries, byLead: { ...(invoiceCache.byLead||{}), [leadId]: [created, ...(((invoiceCache.byLead||{})[leadId])||[]).filter(x=>x._id!==d.id)] } };
          setInvoiceCache(next); saveInvCache(next);
        } else remain.push(d);
      } catch { remain.push(d); }
    }
    writeDrafts(remain);
  };

  const invBadge = (leadId, leadObj) => {
    if (rowSaving === leadId) return <small className="muted">saving…</small>;
    const s = (invoiceCache.summaries||{})[leadId];
    if (!s) return (
      <button className="badge badge-neutral clickable" onClick={()=>openInvoiceCreate(leadId, leadObj)}>
        No Invoice
      </button>
    );
    const label = s.number ? `Invoice #${s.number}` : `Invoice #${String(s.invoiceId).slice(-6)}`;
    const chipClass = (s.status==='Paid')? 'badge-success' : 'badge-warning';
    return (
      <button className={`badge ${chipClass} clickable`} onClick={()=>openInvoiceView(leadId, s.invoiceId)}>
        {label}
      </button>
    );
  };

  return (
    <AdminLayout>
      <div className="crm-container">
        {banner && <div className="ph-banner" role="status">{banner}</div>}
        <div className="crm-header">
          <h1>CRM Leads</h1>
          <div className="overview-grid">
            {STAGES.map(s => (
              <div key={s} className="status-card">
                <div className="status-head">
                  <div>{s}</div>
                  <div className="status-count">
                    <small className="muted">{summary.percentages[s]||0}%</small>
                    <span className={`badge stage-${s.replace(/\s/g,'-').toLowerCase()}`}>{summary.totals[s]||0}</span>
                  </div>
                </div>
                <div className="progress"><div className="progress-inner" style={{width:`${summary.percentages[s]||0}%`}}/></div>
              </div>
            ))}
            <div className="status-card">
              <div className="status-head">
                <div>Hot</div>
                <div className="status-count">
                  <small className="muted">{summary.total ? Math.round((summary.hot/summary.total)*100) : 0}%</small>
                  <span className="badge">{summary.hot||0}</span>
                </div>
              </div>
              <div className="progress red"><div className="progress-inner red" style={{width:`${summary.total ? Math.round((summary.hot/summary.total)*100) : 0}%`}}/></div>
            </div>
            <div className="status-card">
              <div className="status-head">
                <div>Cold</div>
                <div className="status-count">
                  <small className="muted">{summary.total ? Math.round((summary.cold/summary.total)*100) : 0}%</small>
                  <span className="badge">{summary.cold||0}</span>
                </div>
              </div>
              <div className="progress slate"><div className="progress-inner slate" style={{width:`${summary.total ? Math.round((summary.cold/summary.total)*100) : 0}%`}}/></div>
            </div>
          </div>
          <div className="actions-row">
            <button className="btn" onClick={() => navigate('/admin/crm/leads/new')}>Create Lead</button>
            <button className="btn" onClick={exportCSV}>Export CSV</button>
            <button className="btn ghost" onClick={()=>fetchLeads()} disabled={loading}>Refresh</button>
            <select onChange={(e)=>bulk('update_stage',{stage:e.target.value})} defaultValue="">
              <option value="" disabled>Bulk: Move to stage</option>
              {STAGES.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn danger" onClick={()=>{ if (window.confirm('Delete selected leads? This cannot be undone.')) bulk('delete'); }}>Delete Selected</button>
          </div>
        </div>

        <div className="filters-row">
          <input className="filter-pill" placeholder="Search name/email/mobile" value={query.search} onChange={(e)=>setQuery({...query, search:e.target.value})}/>
          <select className="filter-pill" value={query.stage} onChange={(e)=>setQuery({...query, stage:e.target.value})}>
            <option value="all">All Stages</option>
            {STAGES.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="filter-pill" placeholder="Source (e.g., Google Form)" value={query.source} onChange={(e)=>setQuery({...query, source:e.target.value})}/>
          <input className="filter-pill" placeholder="Owner" value={query.owner} onChange={(e)=>setQuery({...query, owner:e.target.value})}/>
          <input className="filter-pill" type="date" value={query.from} onChange={(e)=>setQuery({...query, from:e.target.value})}/>
          <input className="filter-pill" type="date" value={query.to} onChange={(e)=>setQuery({...query, to:e.target.value})}/>
          <select className="filter-pill" value={query.hot||'all'} onChange={(e)=>setQuery({...query, hot:e.target.value})}>
            <option value="all">All</option>
            <option value="hot">Hot</option>
            <option value="cold">Cold</option>
          </select>
          <button className="btn apply-btn" onClick={applyFilters} disabled={loading}>Apply</button>
        </div>

        <div className="table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e)=>toggleAll(e.target.checked)} checked={selected.size===items.length && items.length>0} /></th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Course</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Hot/Cold</th>
                <th>Owner</th>
                <th>Score</th>
                <th>Next Follow-up</th>
                <th>Created</th>
                <th>Invoice</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12}><div className="skeleton"/></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={12} className="text-center">No leads found</td></tr>
              ) : (
                items.map(l => (
                  <tr key={l._id}>
                    <td><input type="checkbox" checked={selected.has(l._id)} onChange={()=>toggleOne(l._id)} /></td>
                    <td>{l.name}</td>
                    <td>{l.mobile}</td>
                    <td>{l.email || '-'}</td>
                    <td>{l.courseInterest || '-'}</td>
                    <td>{l.source || '-'}</td>
                    <td>
                      <select value={l.stage} onChange={async(e)=>{ const prev=l.stage; const v=e.target.value; try{ await crm.put(`/crm/leads/${l._id}`, { stage: v }); fetchLeads(); } catch{ toast.error('Update failed'); e.target.value=prev; } }}>
                        {STAGES.map(s=> <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className={`pill-toggle ${(l.tags||[]).includes('hot') ? 'hot' : (l.tags||[]).includes('cold') ? 'cold' : ''}`} onClick={async()=>{ const hasHot = (l.tags||[]).includes('hot'); const nextTags = hasHot ? (l.tags||[]).filter(t=>t!=='hot').concat('cold') : (l.tags||[]).filter(t=>t!=='cold').concat('hot'); try{ await crm.put(`/crm/leads/${l._id}`, { tags: Array.from(new Set(nextTags)) }); fetchLeads(); } catch{ toast.error('Toggle failed'); } }}>
                        { (l.tags||[]).includes('hot') ? 'Hot' : ((l.tags||[]).includes('cold') ? 'Cold' : '—') }
                      </button>
                    </td>
                    <td>{l.owner || '-'}</td>
                    <td>{l.score || 0}</td>
                    <td>{l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleDateString() : '-'}</td>
                    <td>{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '-'}</td>
                    <td>{invBadge(l._id, l)}</td>
                    <td className="row-actions">
                      <button className="table-action" onClick={()=>openDrawer(l._id)}>View</button>
                      <button className="table-action" onClick={()=>openDrawer(l._id)}>Edit</button>
                      <button className="table-action" onClick={async ()=>{ await crm.post(`/crm/leads/${l._id}/convert`); toast.success('Converted to student'); fetchLeads(); }}>Convert</button>
                      <button className="table-action danger" onClick={async ()=>{ if (!window.confirm('Delete this lead permanently?')) return; await crm.delete(`/crm/leads/${l._id}`); toast.success('Deleted'); fetchLeads(); }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="btn ghost" disabled={pager.page<=1 || loading} onClick={()=>{ const next = { ...query, page: Math.max(1,(query.page||1)-1) }; setQuery(next); fetchLeads(next); }}>Prev</button>
          <span className="muted">Page {pager.page} of {pager.pages} • {pager.total} leads</span>
          <button className="btn ghost" disabled={pager.page>=pager.pages || loading} onClick={()=>{ const next = { ...query, page: (query.page||1)+1 }; setQuery(next); fetchLeads(next); }}>Next</button>
        </div>

        <div className="card" style={{marginTop:12}}>
          <h3>Google Apps Script – Webhook to CRM</h3>
          <p>Use this sample to forward Google Form submissions to CRM. Replace placeholders (domain and secret).</p>
          <pre style={{whiteSpace:'pre-wrap',background:'#0B1221',color:'#e5e7eb',padding:12,borderRadius:8,overflowX:'auto'}}>{`function onFormSubmit(e){
  var data = e.namedValues;
  var payload = {
    name: data['Name'][0],
    mobile: data['Phone'][0],
    email: data['Email'][0],
    courseInterest: data['Course'][0],
    notes: data['Message'] ? data['Message'][0] : ''
  };
  var url = 'https://YOUR_DOMAIN/api/crm/leads/webhook';
  var options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), headers: { 'x-webhook-secret': 'YOUR_SECRET_HERE' } };
  UrlFetchApp.fetch(url, options);
}`}</pre>
        </div>

        <div className={`ph-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
          <div className="ph-drawer-header">
            <h3>Lead Details</h3>
            <button className="ph-close" onClick={closeDrawer}>×</button>
          </div>
          <div className="ph-drawer-body">
            {!leadDetail ? (<div className="skeleton"/>) : (
              <>
                <div className="lead-meta">
                  <strong>{leadDetail.name}</strong>
                  {(leadDetail.source||'').toLowerCase().includes('google') && <span className="badge" style={{marginLeft:8}}>Captured via Google Form</span>}
                </div>
                <div className="tabs" style={{marginTop:8}}>
                  {['Overview','Activities','Invoices'].map(t => (
                    <button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>{t}</button>
                  ))}
                </div>
                {activeTab === 'Overview' && (
                  <div>
                    <div className="form-grid">
                      <label><span>Name</span><input value={leadDetail.name||''} onChange={(e)=>setLeadDetail({...leadDetail, name:e.target.value})} onBlur={()=>updateLeadInline({ name: leadDetail.name })} /></label>
                      <label><span>Mobile</span><input value={leadDetail.mobile||''} onChange={(e)=>setLeadDetail({...leadDetail, mobile:e.target.value})} onBlur={()=>updateLeadInline({ mobile: leadDetail.mobile })} /></label>
                      <label><span>Email</span><input value={leadDetail.email||''} onChange={(e)=>setLeadDetail({...leadDetail, email:e.target.value})} onBlur={()=>updateLeadInline({ email: leadDetail.email })} /></label>
                      <label><span>Source</span><input value={leadDetail.source||''} onChange={(e)=>setLeadDetail({...leadDetail, source:e.target.value})} onBlur={()=>updateLeadInline({ source: leadDetail.source })} /></label>
                      <label><span>Owner</span><input value={leadDetail.owner||''} onChange={(e)=>setLeadDetail({...leadDetail, owner:e.target.value})} onBlur={()=>updateLeadInline({ owner: leadDetail.owner })} /></label>
                      <label><span>Stage</span>
                        <select value={leadDetail.stage} onChange={(e)=>{ const v=e.target.value; setLeadDetail({...leadDetail, stage:v}); updateLeadInline({ stage: v }); }}>
                          {STAGES.map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label style={{gridColumn:'1 / -1'}}><span>Notes</span><textarea rows={3} value={leadDetail.notes||''} onChange={(e)=>setLeadDetail({...leadDetail, notes:e.target.value})} onBlur={()=>updateLeadInline({ notes: leadDetail.notes })} /></label>
                    </div>
                    <div className="card" style={{marginTop:8}}>
                      <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}>
                        <span className="badge">Created {new Date(leadDetail.createdAt).toLocaleString()}</span>
                        <span className="badge">Updated {new Date(leadDetail.updatedAt).toLocaleString()}</span>
                        {leadDetail.source && <span className="badge">Source: {leadDetail.source}</span>}
                        {(leadDetail.tags||[]).map(t=> <span key={t} className="badge">{t}</span>)}
                      </div>
                      {leadDetail.meta && Object.keys(leadDetail.meta||{}).length>0 && (
                        <pre className="meta-json">{JSON.stringify(leadDetail.meta, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'Activities' && (
                  <div>
                    <ActivityForm onSubmit={logActivity} />
                    <ul className="activity-list" style={{marginTop:8}}>
                      {activities.map(a => (
                        <li key={a._id}>
                          <div className="activity-header">
                            <span className={`badge type-${a.type}`}>{a.type.toUpperCase()}</span>
                            <strong style={{marginLeft:6}}>{a.title}</strong>
                            <span className="muted" style={{marginLeft:6}}>{new Date(a.createdAt).toLocaleString()}</span>
                          </div>
                          {a.content && <div className="activity-content">{a.content}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === 'Invoices' && (
                  <div>
                    <button className="btn" onClick={()=>setInvModalOpen(true)}>Create Invoice</button>
                    <div className="table-wrapper" style={{marginTop:10}}>
                      <table className="crm-table">
                        <thead><tr><th>No</th><th>Date</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                          {invoices.map(inv => {
                            const paid = inv.amountPaid || 0; const due = Math.max((inv.total||0)-paid,0);
                            let st = 'Pending'; if (paid>= (inv.total||0) && (inv.total||0)>0) st='Paid'; else if (paid>0) st='Partial';
                            return (
                              <tr key={inv._id}>
                                <td>{inv.number || '(local)'}</td>
                                <td>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}</td>
                                <td>{inv.items?.length||0}</td>
                                <td>{formatINR(inv.total||0)}</td>
                                <td>{formatINR(paid)}</td>
                                <td>{formatINR(due)}</td>
                                <td><span className={`badge ${st==='Paid'?'inv-paid':st==='Partial'?'inv-partial':'inv-pending'}`}>{st}{inv.local?' (local)':''}</span></td>
                                <td>
                                  <button className="link" onClick={()=>crm.post(`/crm/invoices/${inv._id}/send`).then(()=>toast.success('Email sent')).catch(()=>toast.error('Email failed'))}>Send Payment Link</button>
                                  <button className="link" onClick={()=>downloadPDF(inv._id)}>Download PDF</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className={`ph-backdrop ${drawerOpen ? 'show' : ''}`} onClick={closeDrawer} />
      </div>
      {/* Invoice Drawer - shared for create/view/edit */}
      {invoiceDrawer.open && (
        <InvoiceDrawer
          state={invoiceDrawer}
          onClose={()=>setInvoiceDrawer({ open:false, mode:'create', lead:null, invoice:null })}
          onSaved={(created)=>{
            // optimistic row update
            const paid = created.amountPaid || 0; const total = created.total || 0;
            const st = paid >= total && total>0 ? 'Paid' : (paid>0 ? 'Partial' : 'Pending');
            const nextSummaries = { ...(invoiceCache.summaries||{}), [created.leadId || (invoiceDrawer.lead?._id)]: { invoiceId: created._id, number: created.number || null, total, amountPaid: paid, status: st } };
            const next = { summaries: nextSummaries, byLead: { ...(invoiceCache.byLead||{}), [created.leadId || (invoiceDrawer.lead?._id)]: [created, ...(((invoiceCache.byLead||{})[created.leadId || (invoiceDrawer.lead?._id)])||[])] } };
            setInvoiceCache(next); saveInvCache(next);
            setRowSaving('');
          }}
          setRowSaving={setRowSaving}
        />
      )}
    </AdminLayout>
  );
};

// Drawer + Badge + Form components (shared)
const Drawer = ({ open, title, onClose, children }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className={`ph-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <div className={`ph-drawer open`} role="dialog" aria-modal="true">
        <div className="ph-drawer-header">
          <h3>{title}</h3>
          <button className="ph-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ph-drawer-body">{children}</div>
      </div>
    </>
  );
};

const defaultItem = { description: '', quantity: 1, unitPrice: 0 };

const InvoiceModal = ({ open, onClose, onSaved, context }) => {
  const [form, setForm] = useState({ leadId: context?.leadId || '', items: [{...defaultItem}], gstRate: 18, discount: 0, notes: '' });
  const addItem = () => setForm({ ...form, items: [...form.items, { ...defaultItem }] });
  const setItem = (idx, key, val) => { const items = form.items.slice(); items[idx] = { ...items[idx], [key]: val }; setForm({ ...form, items }); };
  const totals = useMemo(() => {
    const subtotal = form.items.reduce((s,i)=> s + (Number(i.quantity||0)*Number(i.unitPrice||0)), 0);
    const discount = Number(form.discount||0);
    const taxable = Math.max(subtotal - discount, 0);
    const gstAmount = Math.round(((Number(form.gstRate||0)/100) * taxable) * 100)/100;
    const total = Math.round((taxable + gstAmount) * 100)/100;
    return { subtotal, gstAmount, total };
  }, [form]);

  const save = async () => {
    try {
      // sanitize and validate
      const cleanedItems = (form.items || [])
        .map(i => ({
          description: (i.description || '').trim(),
          quantity: Math.max(1, Number(i.quantity || 0)),
          unitPrice: Math.max(0, Number(i.unitPrice || 0))
        }))
        .filter(i => i.description.length > 0);
      if (cleanedItems.length === 0) { toast.error('Add at least one item with description'); return; }

      const payload = {
        items: cleanedItems,
        gstRate: Number(form.gstRate || 0),
        discount: Math.max(0, Number(form.discount || 0)),
        notes: form.notes || ''
      };
      const lead = (form.leadId || '').trim();
      if (lead) payload.leadId = lead;

      const { data } = await crm.post('/crm/invoices', payload);
      if (data.success) { toast.success('Invoice created'); onSaved?.(data.invoice); onClose(); }
    } catch (e) {
      if (!e.response || e.response.status === 404) {
        const drafts = (()=>{ try { return JSON.parse(localStorage.getItem('crm:invoices:draft'))||[]; } catch { return []; } })();
        const localInv = { _id: `local-${Date.now()}`, number: null, createdAt: new Date().toISOString(), items: (form.items||[]), total: totals.total, amountPaid: 0, status: 'Pending', local: true };
        drafts.unshift({ id: localInv._id, payload: { ...form } });
        try { localStorage.setItem('crm:invoices:draft', JSON.stringify(drafts)); } catch {}
        onSaved?.(localInv);
        toast.info('API offline — saved locally');
        onClose();
      } else {
        toast.error(e.response?.data?.message || 'Failed to create invoice');
      }
    }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create Invoice</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <label>
            <span>Lead ID (optional)</span>
            <input value={form.leadId} onChange={(e)=>setForm({ ...form, leadId: e.target.value })}/>
          </label>
          {form.items.map((it, idx) => (
            <div key={idx} className="item-row">
              <input placeholder="Description" value={it.description} onChange={(e)=>setItem(idx,'description',e.target.value)} />
              <input type="number" min={1} placeholder="Qty" value={it.quantity} onChange={(e)=>setItem(idx,'quantity',Number(e.target.value))} />
              <input type="number" min={0} step="0.01" placeholder="Unit Price" value={it.unitPrice} onChange={(e)=>setItem(idx,'unitPrice',Number(e.target.value))} />
            </div>
          ))}
          <button className="btn" onClick={addItem}>Add Item</button>
          <div className="grid-two">
            <label>
              <span>GST %</span>
              <input type="number" min={0} step="0.01" value={form.gstRate} onChange={(e)=>setForm({ ...form, gstRate: Number(e.target.value) })} />
            </label>
            <label>
              <span>Discount</span>
              <input type="number" min={0} step="0.01" value={form.discount} onChange={(e)=>setForm({ ...form, discount: Number(e.target.value) })} />
            </label>
          </div>
          <div className="totals">
            <div>Subtotal: {totals.subtotal}</div>
            <div>GST: {totals.gstAmount}</div>
            <div className="grand-total">Total: {totals.total}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={save}>Save</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const ActivityForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ type: 'note', title: '', content: '' });
  return (
    <div className="activity-form">
      <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
        <option value="note">Note</option>
        <option value="call">Call</option>
        <option value="meeting">Meeting</option>
      </select>
      <input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} />
      <textarea placeholder="Details" rows={3} value={form.content} onChange={(e)=>setForm({...form, content:e.target.value})} />
      <button className="btn" onClick={()=>{ if (!form.title) return; onSubmit(form); setForm({ type:'note', title:'', content:'' }); }}>Log Activity</button>
    </div>
  );
};

// Open create/view helpers
function openInvoiceCreateHelper(setInvoiceDrawer, lead) {
  const initial = {
    billingName: lead?.name || '',
    email: lead?.email || '',
    mobile: lead?.mobile || '',
    course: lead?.courseInterest || '',
    address: '',
    amount: 0,
    tax: 18,
    discount: 0,
    method: 'UPI',
    dueDate: '',
    notes: ''
  };
  setInvoiceDrawer({ open:true, mode:'create', lead, invoice: { form: initial } });
}

function openInvoiceViewHelper(setInvoiceDrawer, lead, invoice) {
  setInvoiceDrawer({ open:true, mode:'view', lead, invoice });
}

const InvoiceDrawer = ({ state, onClose, onSaved, setRowSaving }) => {
  const mode = state.mode;
  const lead = state.lead;
  const [form, setForm] = useState(state.invoice?.form || {
    billingName: lead?.name || '',
    email: lead?.email || '',
    mobile: lead?.mobile || '',
    course: lead?.courseInterest || '',
    address: '',
    amount: 0,
    tax: 18,
    discount: 0,
    method: 'UPI',
    dueDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const totals = useMemo(() => {
    const base = Math.max(Number(form.amount||0), 0);
    const disc = Math.max(Number(form.discount||0), 0);
    const tax = Math.max(Number(form.tax||0), 0);
    const afterDisc = Math.max(base - (base*disc/100), 0);
    const gst = Math.round(afterDisc * (tax/100) * 100)/100;
    const total = Math.round((afterDisc + gst) * 100)/100;
    return { base, afterDisc, gst, total };
  }, [form]);

  const validate = () => {
    const e = {};
    if (!form.billingName?.trim()) e.billingName = 'Required';
    if (!totals.base) e.amount = 'Amount > 0 required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    try {
      setRowSaving?.(lead?._id || '');
      const discountAmount = Math.round(totals.base * (Number(form.discount||0)/100));
      const payload = {
        leadId: lead?._id,
        items: [{ description: form.course || 'Course Fee', quantity: 1, unitPrice: totals.base }],
        discount: discountAmount,
        gstRate: Number(form.tax||0),
        notes: form.notes || '',
      };
      const { data } = await crm.post('/crm/invoices', payload);
      if (data.success) { onSaved?.(data.invoice); onClose?.(); }
    } catch (e) {
      setRowSaving?.('');
      try { toast.error(e.response?.data?.message || 'Failed to create invoice'); } catch {}
    }
  };

  const [viewData, setViewData] = useState(state.invoice || null);
  useEffect(() => {
    if (mode !== 'view') return;
    if (state.invoice && state.invoice._id) return; // already provided
    const fetchInv = async () => {
      try {
        const { data } = await crm.get('/crm/invoices', { params: { leadId: lead?._id } });
        if (data.success && (data.items||[]).length) setViewData(data.items[0]);
      } catch {}
    };
    fetchInv();
  }, [mode, lead, state.invoice]);

  return (
    <Drawer open={state.open} title={mode==='view' ? 'View Invoice' : 'Create Invoice'} onClose={onClose}>
      {mode === 'view' ? (
        !viewData ? <div className="skeleton"/> : (
          <div className="invoice-view">
            <div className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h3 style={{margin:0}}>Invoice {viewData.number || viewData._id}</h3>
                <span className={`badge ${ (viewData.amountPaid||0) >= (viewData.total||0) ? 'inv-paid' : 'inv-pending' }`}>
                  { (viewData.amountPaid||0) >= (viewData.total||0) ? 'Paid' : 'Unpaid' }
                </span>
              </div>
              <div className="muted" style={{marginTop:6}}>{new Date(viewData.createdAt).toLocaleString()}</div>
            </div>
            <div className="card" style={{marginTop:8}}>
              <h4>Buyer</h4>
              <div>{lead?.name} • {lead?.email} • {lead?.mobile}</div>
              {lead?.courseInterest && <div className="muted">Course: {lead.courseInterest}</div>}
            </div>
            <div className="card" style={{marginTop:8}}>
              <h4>Amounts</h4>
              <div>Subtotal: {viewData.subtotal}</div>
              <div>Discount: {viewData.discount||0}</div>
              <div>GST ({viewData.gstRate}%): {viewData.gstAmount}</div>
              <div><strong>Total: {viewData.total}</strong></div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:10}}>
              <a className="btn" href={`${API_BASE}/crm/invoices/${viewData._id}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
              <button className="btn" onClick={async()=>{ try{ await crm.put(`/crm/invoices/${viewData._id}`, { status:'Paid', amountPaid: viewData.total, paidAt: new Date().toISOString() }); toast.success('Marked paid'); setViewData({ ...viewData, status:'Paid', amountPaid: viewData.total }); } catch{ toast.error('Failed'); } }}>Mark as Paid</button>
              <button className="btn ghost" onClick={()=>{ setViewData(null); }}>Edit</button>
            </div>
          </div>
        )
      ) : (
        <form className="form-grid" onSubmit={(e)=>{ e.preventDefault(); save(); }}>
          <label><span>Billing Name</span><input value={form.billingName} onChange={(e)=>setForm({...form,billingName:e.target.value})} aria-invalid={!!errors.billingName} />{errors.billingName && <small className="muted" role="alert">{errors.billingName}</small>}</label>
          <label><span>Email</span><input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
          <label><span>Mobile</span><input value={form.mobile} onChange={(e)=>setForm({...form,mobile:e.target.value})} /></label>
          <label><span>Course</span><input value={form.course} onChange={(e)=>setForm({...form,course:e.target.value})} /></label>
          <label style={{gridColumn:'1 / -1'}}><span>Address</span><textarea rows={2} value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} /></label>
          <label><span>Amount (₹)</span><input type="number" min={0} step="0.01" value={form.amount} onChange={(e)=>setForm({...form,amount:Number(e.target.value)})} aria-invalid={!!errors.amount} />{errors.amount && <small className="muted" role="alert">{errors.amount}</small>}</label>
          <label><span>Tax %</span><input type="number" min={0} step="0.01" value={form.tax} onChange={(e)=>setForm({...form,tax:Number(e.target.value)})} /></label>
          <label><span>Discount %</span><input type="number" min={0} step="0.01" value={form.discount} onChange={(e)=>setForm({...form,discount:Number(e.target.value)})} /></label>
          <label><span>Payment Method</span><select value={form.method} onChange={(e)=>setForm({...form,method:e.target.value})}><option>UPI</option><option>Card</option><option>Cash</option></select></label>
          <label><span>Due Date</span><input type="date" value={form.dueDate} onChange={(e)=>setForm({...form,dueDate:e.target.value})} /></label>
          <label style={{gridColumn:'1 / -1'}}><span>Notes</span><textarea rows={2} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} /></label>
          <div className="totals" style={{gridColumn:'1 / -1'}}>
            <div>After Discount: {totals.afterDisc}</div>
            <div>GST: {totals.gst}</div>
            <div className="grand-total">Total: {totals.total}</div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',gridColumn:'1 / -1'}}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Save Invoice</button>
          </div>
        </form>
      )}
    </Drawer>
  );
};

function CRMLeadsExtras(){ return null; }

export default CRMLeads;
