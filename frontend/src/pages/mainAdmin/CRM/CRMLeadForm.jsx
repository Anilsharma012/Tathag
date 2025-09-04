import React, { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import crm from '../../../utils/crmApi';
import './crm.css';
import { toast } from 'react-toastify';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const STAGES = ['New','Contacted','Demo Scheduled','Negotiation','Won','Lost'];

const CRMLeadForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [sp] = useSearchParams();
  const isEdit = !!params.id || sp.get('edit') === '1';
  const [form, setForm] = useState({ name:'', mobile:'', email:'', courseInterest:'', source:'', stage:'New', owner:'', score:0, tags:'', notes:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (params.id) {
        const { data } = await crm.get(`/crm/leads/${params.id}`);
        if (data.success) {
          const { lead } = data;
          setForm({ ...lead, tags: (lead.tags||[]).join(',') });
        }
      }
    };
    load();
  }, [params.id]);

  const save = async () => {
    if (!form.name || !form.mobile) return toast.error('Name and mobile are required');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] };
      if (params.id) await crm.put(`/crm/leads/${params.id}`, payload);
      else await crm.post('/crm/leads', payload);
      toast.success('Saved');
      navigate('/admin/crm/leads');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="crm-container">
        <div className="crm-header">
          <h1>{params.id ? 'Edit Lead' : 'Create Lead'}</h1>
          <div className="actions-row">
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn ghost" onClick={()=>navigate('/admin/crm/leads')}>Cancel</button>
          </div>
        </div>

        <div className="form-grid">
          <label>
            <span>Name*</span>
            <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
          </label>
          <label>
            <span>Mobile*</span>
            <input value={form.mobile} onChange={(e)=>setForm({...form, mobile:e.target.value})} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={form.email||''} onChange={(e)=>setForm({...form, email:e.target.value})} />
          </label>
          <label>
            <span>Course Interest</span>
            <input value={form.courseInterest||''} onChange={(e)=>setForm({...form, courseInterest:e.target.value})} />
          </label>
          <label>
            <span>Source</span>
            <input value={form.source||''} onChange={(e)=>setForm({...form, source:e.target.value})} />
          </label>
          <label>
            <span>Stage</span>
            <select value={form.stage} onChange={(e)=>setForm({...form, stage:e.target.value})}>
              {STAGES.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            <span>Owner</span>
            <input value={form.owner||''} onChange={(e)=>setForm({...form, owner:e.target.value})} />
          </label>
          <label>
            <span>Score</span>
            <input type="number" value={form.score||0} onChange={(e)=>setForm({...form, score:Number(e.target.value)})} />
          </label>
          <label className="full">
            <span>Tags (comma separated)</span>
            <input value={form.tags||''} onChange={(e)=>setForm({...form, tags:e.target.value})} />
          </label>
          <label className="full">
            <span>Notes</span>
            <textarea rows={4} value={form.notes||''} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          </label>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CRMLeadForm;
