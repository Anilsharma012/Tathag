import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import axios from 'axios';
import './PaymentManagement.css';
import { toast } from 'react-toastify';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');
  const initials = (name) => {
    const s = String(name ?? '').trim();
    if (!s) return 'S';
    return s.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
  };
  const [filters, setFilters] = useState({
    status: '',
    courseId: '',
    startDate: '',
    endDate: ''
  });
  const [offlineItems, setOfflineItems] = useState([]);
  const [manualForm, setManualForm] = useState({ userId: '', courseId: '', amount: '', note: '', status: 'paid' });
  const [manualFile, setManualFile] = useState(null);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadPayments();
    loadStudentsWithPurchases();
    loadOffline();
    loadCoursesPublic();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });

      if (response.data?.success) {
        setPayments(response.data.payments || []);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error(error.response?.data?.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsWithPurchases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/students-with-purchases', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setStudents(response.data.students || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error(error.response?.data?.message || 'Failed to load students data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOffline = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/admin/offline-payments', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.success) setOfflineItems(res.data.items || []); else setOfflineItems([]);
    } catch (e) {
      console.error('Error loading offline payments:', e);
      toast.error(e.response?.data?.message || 'Failed to load offline payments');
      setOfflineItems([]);
    }
  };

  const approveOffline = async (paymentId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/payment/${paymentId}/offline/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await Promise.all([loadOffline(), loadPayments(), loadStudentsWithPurchases()]);
      toast.success('Offline payment verified');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve');
    }
  };

  const rejectOffline = async (paymentId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/payment/${paymentId}/offline/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await loadOffline();
      toast.success('Offline payment rejected');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject');
    }
  };

  const submitManual = async (e) => {
    e.preventDefault();
    if (!manualForm.userId || !manualForm.courseId || !manualForm.amount || !manualFile) {
      toast.error('Student, Course, Amount and Slip are required');
      return;
    }
    try {
      setSubmittingManual(true);
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('userId', manualForm.userId.trim());
      fd.append('courseId', manualForm.courseId.trim());
      fd.append('amount', String(Math.round(Number(manualForm.amount) * 100)));
      fd.append('status', manualForm.status);
      if (manualForm.note) fd.append('note', manualForm.note);
      fd.append('slip', manualFile);
      await axios.post('/api/admin/payment/manual', fd, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Manual payment submitted');
      setManualForm({ userId: '', courseId: '', amount: '', note: '', status: 'paid' });
      setManualFile(null);
      await Promise.all([loadOffline(), loadPayments(), loadStudentsWithPurchases()]);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmittingManual(false);
    }
  };

  const updateCourseStatus = async (studentId, courseId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `/api/admin/student/${studentId}/course/${courseId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Course status updated to ${status}`);
        loadStudentsWithPurchases(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Failed to update course status');
    }
  };

  const downloadReceipt = async (receiptId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `/api/admin/receipt/${receiptId}/download?format=html`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to download receipt');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format((Number(amount) || 0) / 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'chip-paid';
      case 'created': return 'chip-created';
      case 'failed': return 'chip-failed';
      case 'unlocked': return 'chip-unlocked';
      case 'locked': return 'chip-locked';
      case 'pending_offline': return 'chip-created';
      case 'rejected': return 'chip-failed';
      default: return 'chip-default';
    }
  };

  // Load published courses for manual upload convenience (public endpoint)
  const loadCoursesPublic = async () => {
    try {
      const res = await axios.get('/api/courses/student/published-courses');
      setCourses(res.data?.courses || res.data || []);
    } catch (e) {
      setCourses([]);
    }
  };

  // Resolve helpers: allow entering email/name/ID or course name/ID
  const resolveStudentId = (value) => {
    const v = String(value||'').trim().toLowerCase();
    if (!v) return '';
    const s = students.find(x => String(x._id) === v || String(x.email||'').toLowerCase() === v || String(x.name||'').toLowerCase() === v);
    return s ? s._id : value;
  };
  const resolveCourseId = (value) => {
    const v = String(value||'').trim().toLowerCase();
    if (!v) return '';
    const c = courses.find(x => String(x._id) === v || String(x.name||'').toLowerCase() === v);
    return c ? c._id : value;
  };

  return (
    <AdminLayout>
      <div className="payment-management">
        <div className="page-header">
          <h1>Payment Management</h1>
          <p>Manage student payments and course access</p>
        </div>

        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            All Payments
          </button>
          <button
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students & Purchases
          </button>
          <button
            className={`tab-btn ${activeTab === 'offline' ? 'active' : ''}`}
            onClick={() => setActiveTab('offline')}
          >
            Offline Slips
          </button>
        </div>

        {activeTab === 'payments' && (
          <div className="payments-section">
            <div className="filters">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="created">Created</option>
                <option value="failed">Failed</option>
              </select>
              <button onClick={loadPayments} className="filter-btn">
                Filter
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading payments...</div>
            ) : (
              <div className="payments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan={7} className="empty-row">No payments found</td></tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment._id}>
                          <td>{payment._id.substring(0, 8)}...</td>
                          <td>
                            <div className="student-cell">
                              <div className="avatar">{initials(payment.userId?.name || 'S')}</div>
                              <div>
                                <div>{payment.userId?.name || 'N/A'}</div>
                                <div className="email">{payment.userId?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{payment.courseId?.name || 'N/A'}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>
                            <span className={`status-chip ${getStatusClass(payment.status)}`}>
                              {payment.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{formatDate(payment.createdAt)}</td>
                          <td>
                            {payment.status === 'paid' && (
                              <button onClick={() => downloadReceipt(payment._id)} className="action-btn">Download Receipt</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="students-section">
            {loading ? (
              <div className="loading">Loading students...</div>
            ) : (
              <div className="students-list">
                {students.map((student) => (
                  <div key={student._id} className="student-card">
                    <div className="student-header">
                      <div className="header-left">
                        <div className="student-avatar">{initials(student.name)}</div>
                        <div>
                          <h3>{student.name}</h3>
                          <div className="student-meta">
                            <span>{student.email}</span>
                            <span>Total Spent: {formatCurrency(student.totalSpent || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="student-courses">
                      <h4>Enrolled Courses:</h4>
                      {student.enrolledCourses?.length > 0 ? (
                        <div className="courses-grid">
                          {student.enrolledCourses.map((enrollment) => (
                            <div key={enrollment._id} className="course-item">
                              <div className="course-info">
                                <span className="course-name">
                                  {enrollment.courseId?.name || 'Course'}
                                </span>
                                <span className="enrollment-date">
                                  Enrolled: {formatDate(enrollment.enrolledAt)}
                                </span>
                              </div>
                              <div className="course-actions">
                                <span className={`status-chip ${getStatusClass(enrollment.status)}`}>
                                  {enrollment.status.toUpperCase()}
                                </span>
                                <select
                                  value={enrollment.status}
                                  onChange={(e) =>
                                    updateCourseStatus(
                                      student._id,
                                      enrollment.courseId._id,
                                      e.target.value
                                    )
                                  }
                                  className="status-select"
                                >
                                  <option value="locked">Locked</option>
                                  <option value="unlocked">Unlocked</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No courses enrolled</p>
                      )}
                    </div>

                    {student.payments?.length > 0 && (
                      <div className="student-payments">
                        <h4>Payment History:</h4>
                        <div className="payments-summary">
                          {student.payments.slice(0, 3).map((payment) => (
                            <div key={payment._id} className="payment-item">
                              <span>{payment.courseId?.name}</span>
                              <span>{formatCurrency(payment.amount)}</span>
                              <span className={`status-chip small ${getStatusClass(payment.status)}`}>
                                {payment.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'offline' && (
          <div className="offline-section">
            <div className="manual-upload-card">
              <h3>Manual Upload</h3>
              <form onSubmit={submitManual} className="manual-form">
                <div className="row">
                  <input placeholder="Student (email or ID)" value={manualForm.userId} onBlur={e => setManualForm(v => ({ ...v, userId: resolveStudentId(e.target.value) }))} onChange={e => setManualForm(v => ({ ...v, userId: e.target.value }))} />
                  <input placeholder="Course (name or ID)" value={manualForm.courseId} onBlur={e => setManualForm(v => ({ ...v, courseId: resolveCourseId(e.target.value) }))} onChange={e => setManualForm(v => ({ ...v, courseId: e.target.value }))} />
                  <input type="number" step="0.01" placeholder="Amount (INR)" value={manualForm.amount} onChange={e => setManualForm(v => ({ ...v, amount: e.target.value }))} />
                  <select value={manualForm.status} onChange={e => setManualForm(v => ({ ...v, status: e.target.value }))}>
                    <option value="paid">Mark Paid</option>
                    <option value="pending_offline">Mark Pending</option>
                  </select>
                </div>
                <div className="row">
                  <input placeholder="Note (optional)" value={manualForm.note} onChange={e => setManualForm(v => ({ ...v, note: e.target.value }))} />
                  <input type="file" accept="image/*" onChange={e => setManualFile(e.target.files?.[0] || null)} />
                  <button type="submit" className="action-btn" disabled={submittingManual || !manualFile}>{submittingManual ? 'Submitting…' : 'Submit'}</button>
                </div>
              </form>
            </div>

            <div className="offline-grid">
              {offlineItems.map(it => (
                <div key={it._id} className="offline-card">
                  <div className="slip-thumb">
                    {it.offlineSlipUrl ? (
                      <img src={it.offlineSlipUrl} alt="Slip" />
                    ) : (
                      <div className="no-thumb">No Slip</div>
                    )}
                  </div>
                  <div className="offline-meta">
                    <div className="meta-top">
                      <div className="avatar small">{initials(it.userId?.name || 'S')}</div>
                      <div>
                        <div className="name">{it.userId?.name || '—'}</div>
                        <div className="email">{it.userId?.email || ''}</div>
                      </div>
                    </div>
                    <div className="meta-row"><span>{it.courseId?.name || '—'}</span><span>{formatCurrency(it.amount)}</span></div>
                    <div className="meta-row"><span className={`status-chip ${getStatusClass(it.status)}`}>{it.status.toUpperCase()}</span><span className="muted">{it._id.substring(0,8)}…</span></div>
                  </div>
                  <div className="offline-actions">
                    {it.status === 'pending_offline' ? (
                      <>
                        <button className="verify-btn" onClick={() => approveOffline(it._id)}>Verify</button>
                        <button className="reject-btn" onClick={() => rejectOffline(it._id)}>Reject</button>
                      </>
                    ) : (
                      <a className="view-btn" href={it.offlineSlipUrl || '#'} target="_blank" rel="noreferrer">View</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentManagement;
