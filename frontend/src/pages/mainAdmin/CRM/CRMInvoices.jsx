import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import crm from '../../../utils/crmApi';
import './crm.css';
import { toast } from 'react-toastify';

const defaultItem = { description: '', quantity: 1, unitPrice: 0 };

const InvoiceModal = ({ open, onClose, onSaved, context }) => {
  const [form, setForm] = useState({ leadId: context?.leadId || '', items: [{...defaultItem}], gstRate: 18, discount: 0, notes: '' });
  const addItem = () => setForm({ ...form, items: [...form.items, { ...defaultItem }] });
  const setItem = (idx, key, val) => {
    const items = form.items.slice();
    items[idx] = { ...items[idx], [key]: val };
    setForm({ ...form, items });
  };

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
      // Basic validation and sanitization
      const cleanedItems = (form.items || [])
        .map(i => ({
          description: (i.description || '').trim(),
          quantity: Math.max(1, Number(i.quantity || 0)),
          unitPrice: Math.max(0, Number(i.unitPrice || 0))
        }))
        .filter(i => i.description.length > 0);

      if (cleanedItems.length === 0) {
        toast.error('Add at least one item with description');
        return;
      }

      const payload = {
        items: cleanedItems,
        gstRate: Number(form.gstRate || 0),
        discount: Math.max(0, Number(form.discount || 0)),
        notes: form.notes || ''
      };
      const lead = (form.leadId || '').trim();
      if (lead) payload.leadId = lead; // omit empty to avoid ObjectId cast error

      await crm.post('/crm/invoices', payload);
      toast.success('Invoice created');
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create invoice');
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
          <label>
            <span>Notes</span>
            <textarea value={form.notes} onChange={(e)=>setForm({ ...form, notes: e.target.value })} />
          </label>
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

const CRMInvoices = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await crm.get('/crm/invoices', { params: { status } });
      if (data.success) setItems(data.items);
    } catch (e) { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);

  useEffect(() => {
    const handler = (e) => { setContext(e.detail || null); setOpen(true); };
    window.addEventListener('open-crm-invoice-modal', handler);
    return () => window.removeEventListener('open-crm-invoice-modal', handler);
  }, []);

  return (
    <AdminLayout>
      <div className="crm-container">
        <div className="crm-header">
          <h1>Invoices</h1>
          <div className="actions-row">
            <button className="btn" onClick={()=>setOpen(true)}>Create Invoice</button>
            <select value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
        {loading ? <div className="skeleton"/> : (
          <div className="table-wrapper">
            <table className="crm-table">
              <thead><tr><th>Number</th><th>Status</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(inv => (
                  <tr key={inv._id}>
                    <td>{inv.number}</td>
                    <td><span className={`badge status-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                    <td>{inv.subtotal}</td>
                    <td>{inv.gstAmount}</td>
                    <td>{inv.total}</td>
                    <td>
                      <button className="link" onClick={()=>crm.post(`/crm/invoices/${inv._id}/send`).then(()=>toast.success('Email sent')).catch(()=>toast.error('Email failed'))}>Send Email</button>
                      <button className="link" onClick={async()=>{
                        const { jsPDF } = await import('jspdf');
                        const doc = new jsPDF();
                        let y = 10;
                        doc.text(`Invoice ${inv.number}`, 10, y); y+=8;
                        doc.text(`Status: ${inv.status}`, 10, y); y+=8;
                        doc.text(`Subtotal: ${inv.subtotal}`, 10, y); y+=8;
                        doc.text(`GST (${inv.gstRate}%): ${inv.gstAmount}`, 10, y); y+=8;
                        doc.text(`Total: ${inv.total}`, 10, y); y+=10;
                        doc.text('Items:', 10, y); y+=6;
                        inv.items.forEach((it, idx)=>{ doc.text(`${idx+1}. ${it.description}  x${it.quantity}  @${it.unitPrice} = ${it.total}`, 12, y); y+=6; if (y>270){ doc.addPage(); y=10; }});
                        doc.save(`${inv.number}.pdf`);
                      }}>Download PDF</button>
                      <button className="link danger" onClick={()=>crm.delete(`/crm/invoices/${inv._id}`).then(()=>{toast.success('Deleted'); load();}).catch(()=>toast.error('Delete failed'))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <InvoiceModal open={open} onClose={()=>setOpen(false)} onSaved={load} context={context} />
    </AdminLayout>
  );
};

export default CRMInvoices;
