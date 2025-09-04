import React, { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import crm from '../../../utils/crmApi';
import { API_BASE } from '../../../utils/apiBase';
import './crm.css';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const Tabs = ['Overview','Activities','Invoices','History'];

const CRMLeadDetail = () => {
  const { id } = useParams();
  const [tab, setTab] = useState('Overview');
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityForm, setActivityForm] = useState({ type: 'note', title: '', content: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await crm.get(`/crm/leads/${id}`);
      if (data.success) {
        setLead(data.lead);
        setActivities(data.activities);
        setInvoices(data.invoices);
      }
    } catch (e) {
      toast.error('Failed to load lead');
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const logActivity = async () => {
    if (!activityForm.title) return toast.error('Title required');
    try {
      const { data } = await crm.post(`/crm/leads/${id}/activities`, activityForm);
      if (data.success) {
        toast.success('Activity logged');
        setActivityForm({ type: 'note', title: '', content: '' });
        load();
      }
    } catch (e) {
      toast.error('Failed to log activity');
    }
  };

  return (
    <AdminLayout>
      <div className="crm-container">
        <div className="crm-header">
          <h1>Lead Detail</h1>
          <div className="lead-meta">
            {lead && (
              <>
                <div><strong>{lead.name}</strong> <span className={`badge stage-${lead.stage?.replace(/\s/g,'-').toLowerCase()}`}>{lead.stage}</span></div>
                <div>{lead.email || '-'} • {lead.mobile}</div>
              </>
            )}
          </div>
        </div>

        <div className="tabs">
          {Tabs.map(t => (
            <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>

        {loading ? <div className="skeleton"/> : (
          <>
            {tab === 'Overview' && lead && (
              <div className="overview-grid">
                <div>
                  <h3>Contact</h3>
                  <p><strong>Name:</strong> {lead.name} {(lead.source||'').toLowerCase().includes('google') && <span className="badge" style={{marginLeft:6}}>Captured via Google Form</span>}</p>
                  <p><strong>Mobile:</strong> {lead.mobile}</p>
                  <p><strong>Email:</strong> {lead.email || '-'}</p>
                  <p><strong>Source:</strong> {lead.source || '-'}</p>
                  <p><strong>Owner:</strong> {lead.owner || '-'}</p>
                </div>
                <div>
                  <h3>Details</h3>
                  <p><strong>Course Interest:</strong> {lead.courseInterest || '-'}</p>
                  <p><strong>Score:</strong> {lead.score || 0}</p>
                  <p><strong>Next Follow-up:</strong> {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleString() : '-'}</p>
                  <p><strong>Tags:</strong> {(lead.tags||[]).join(', ') || '-'}</p>
                </div>
              </div>
            )}

            {tab === 'Activities' && (
              <div className="activities">
                <div className="activity-form">
                  <select value={activityForm.type} onChange={(e)=>setActivityForm({...activityForm, type:e.target.value})}>
                    <option value="note">Note</option>
                    <option value="call">Call</option>
                    <option value="meeting">Meeting</option>
                  </select>
                  <input placeholder="Title" value={activityForm.title} onChange={(e)=>setActivityForm({...activityForm, title:e.target.value})} />
                  <textarea placeholder="Details" rows={3} value={activityForm.content} onChange={(e)=>setActivityForm({...activityForm, content:e.target.value})} />
                  <button className="btn" onClick={logActivity}>Log Activity</button>
                </div>
                <ul className="activity-list">
                  {activities.map(a => (
                    <li key={a._id}>
                      <div className="activity-header">
                        <span className={`badge type-${a.type}`}>{a.type.toUpperCase()}</span>
                        <strong>{a.title}</strong>
                        <span className="muted">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      {a.content && <div className="activity-content">{a.content}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === 'Invoices' && (
              <div>
                <button className="btn" onClick={()=>window.dispatchEvent(new CustomEvent('open-crm-invoice-modal',{ detail: { leadId: id } }))}>Create Proforma</button>
                <div className="table-wrapper">
                  <table className="crm-table">
                    <thead><tr><th>Number</th><th>Date</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {invoices.map(inv => {
                        const paid = inv.amountPaid || 0; const due = Math.max((inv.total||0)-paid,0);
                        let st = 'Pending'; if (paid>= (inv.total||0) && (inv.total||0)>0) st='Paid'; else if (paid>0) st='Partial';
                        return (
                          <tr key={inv._id}>
                            <td>{inv.number}</td>
                            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td>{inv.items?.length||0}</td>
                            <td>{inv.total}</td>
                            <td>{paid}</td>
                            <td>{due}</td>
                            <td><span className={`badge ${st==='Paid'?'inv-paid':st==='Partial'?'inv-partial':'inv-pending'}`}>{st}</span></td>
                            <td>
                              <button className="link" onClick={()=>crm.post(`/crm/invoices/${inv._id}/send`).then(()=>toast.success('Email sent')).catch(()=>toast.error('Email failed'))}>Send Payment Link</button>
                              <button className="link" onClick={()=>window.open(`${API_BASE}/crm/invoices/${inv._id}/pdf`, '_blank')}>Download PDF</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'History' && (
              <ul className="timeline">
                {activities.map(a => (
                  <li key={a._id}>
                    <div>
                      <strong>{a.title}</strong>
                      <span className="muted"> • {new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="muted">{a.type.toUpperCase()}</div>
                    {a.content && <div>{a.content}</div>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CRMLeadDetail;
