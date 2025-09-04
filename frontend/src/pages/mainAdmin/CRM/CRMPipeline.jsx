import React, { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import crm from '../../../utils/crmApi';
import './crm.css';
import { toast } from 'react-toastify';

const STAGES = ['New','Contacted','Demo Scheduled','Negotiation','Won','Lost'];

const CRMPipeline = () => {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await crm.get('/crm/pipeline');
      if (data.success) setColumns(data.stages);
    } catch (e) {
      toast.error('Failed to load pipeline');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onDragStart = (e, lead) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(lead));
  };

  const onDrop = async (e, stage) => {
    e.preventDefault();
    try {
      const lead = JSON.parse(e.dataTransfer.getData('text/plain'));
      await crm.put('/crm/pipeline/move', { leadId: lead._id, toStage: stage, order: 0 });
      load();
    } catch (err) { /* ignore */ }
  };

  return (
    <AdminLayout>
      <div className="crm-container">
        <div className="crm-header"><h1>Pipeline</h1></div>
        {loading ? <div className="skeleton"/> : (
          <div className="kanban">
            {STAGES.map(stage => (
              <div key={stage} className="kanban-col" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>onDrop(e, stage)}>
                <div className={`kanban-col-header stage-${stage.replace(/\s/g,'-').toLowerCase()}`}>{stage}</div>
                <div className="kanban-col-body">
                  {(columns[stage]||[]).map(l => (
                    <div key={l._id} className="kanban-card" draggable onDragStart={(e)=>onDragStart(e,l)}>
                      <div className="card-title">{l.name}</div>
                      <div className="card-sub">{l.mobile} {l.email?`• ${l.email}`:''}</div>
                      <div className="card-meta">{l.courseInterest || '-'} • Owner: {l.owner || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CRMPipeline;
