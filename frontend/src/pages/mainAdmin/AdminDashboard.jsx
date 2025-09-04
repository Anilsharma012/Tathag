import React from "react";
import AdminLayout from "./AdminLayout/AdminLayout";
import "./AdminDashboard.css";
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import MetricCard from "../../components/AdminUI/MetricCard";
import TableMini from "../../components/AdminUI/TableMini";
import ListCompact from "../../components/AdminUI/ListCompact";
import QuickActionsBar from "../../components/AdminUI/QuickActionsBar";
import AlertsBar from "../../components/AdminUI/AlertsBar";
import "../../components/AdminUI/admin-ui.css";
import { FaUsers, FaBookOpen, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ users:null, courses:null, teachers:null, students:null, enroll7:0, rev7:0 });
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [alerts, setAlerts] = useState({ pendingInv:0, expiring:0 });

  useEffect(() => {
    const now = new Date();
    const start7 = new Date(now.getTime() - 7*24*60*60*1000);

    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Courses (public endpoint)
        const coursesRes = await axios.get('/api/courses/student/published-courses');
        const coursesCount = (coursesRes.data?.courses || []).length;

        // Payments 7d
        const params = { startDate: start7.toISOString(), endDate: now.toISOString() };
        let enrollCount = 0; let rev = 0; let payRows = [];
        try {
          const pr = await axios.get('/api/admin/payments', { headers, params });
          const list = pr.data?.payments || pr.data?.items || [];
          enrollCount = list.filter(x => (x.status||'').toLowerCase()==='paid').length;
          rev = list.filter(x=> (x.status||'').toLowerCase()==='paid').reduce((s,x)=> s + (Number(x.amount)||0), 0);
          payRows = list.slice(0,5).map(x=>({ id:x._id, name:x.user?.name||x.studentName||'—', course:x.course?.name||x.courseName||'—', amount:x.amount, status:x.status||'unknown', at:x.createdAt }));
        } catch {}

        // Teachers
        let teachersCount = null;
        try { const tr = await axios.get('/api/subadmin', { headers }); teachersCount = (tr.data?.subAdmins||[]).length; } catch {}

        // Students via purchased list
        let studentsCount = null;
        try { const sr = await axios.get('/api/admin/students-with-purchases', { headers }); studentsCount = (sr.data?.students||[]).length; } catch {}

        // Upcoming classes
        try {
          const cr = await axios.get('/api/live-classes', { params: { limit: 10 } });
          const items = cr.data?.items || cr.data || [];
          const upcoming = items.filter(x => new Date(x.startTime||x.start||0) > now).sort((a,b)=> new Date(a.startTime||a.start) - new Date(b.startTime||b.start)).slice(0,3).map(x=>({ title: x.title || x.topic || 'Class', at: new Date(x.startTime||x.start).toLocaleString(), action: 'View' }));
          setClasses(upcoming);
        } catch { setClasses([]); }

        setMetrics({ users: metrics.users, courses: coursesCount, teachers: teachersCount, students: studentsCount, enroll7: enrollCount, rev7: rev });
        setPayments(payRows);

        // Alerts
        try {
          const invs = await axios.get('/api/crm/invoices', { headers, params: { status: 'pending', limit: 5 } });
          const pending = (invs.data?.items||[]).length;
          setAlerts(a=>({ ...a, pendingInv: pending }));
        } catch {}
        try {
          const enr = await axios.get('/api/admin/students-with-purchases', { headers });
          const expiring = (enr.data?.students||[]).filter(u => (u.enrolledCourses||[]).some(c => c.expiresAt && (new Date(c.expiresAt)-now) < 30*24*60*60*1000)).length;
          setAlerts(a=>({ ...a, expiring }));
        } catch {}
      } catch {}
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paymentCols = useMemo(() => ([
    { key: 'name', label: 'Student' },
    { key: 'course', label: 'Course' },
    { key: 'amount', label: 'Amount', render: v => new Intl.NumberFormat('en-IN',{style:'currency', currency:'INR'}).format(Number(v||0)) },
    { key: 'status', label: 'Status', render: v => (<span className={`admin-chip ${String(v).toLowerCase()==='paid'?'success':'warning'}`}>{v}</span>) },
    { key: 'at', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ]), []);

  return (
    <AdminLayout>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        <AlertsBar pendingInvoices={alerts.pendingInv} expiringEnrollments={alerts.expiring} />

        <div className="admin-grid" style={{marginTop:16}}>
          <div style={{gridColumn:'span 2'}}><MetricCard title="Total Users" value={metrics.users ?? '—'} icon={<FaUsers/>} /></div>
          <div style={{gridColumn:'span 2'}}><MetricCard title="Live Courses" value={metrics.courses ?? '—'} icon={<FaBookOpen/>} /></div>
          <div style={{gridColumn:'span 2'}}><MetricCard title="Teachers" value={metrics.teachers ?? '—'} icon={<FaChalkboardTeacher/>} /></div>
          <div style={{gridColumn:'span 2'}}><MetricCard title="Students" value={metrics.students ?? '—'} icon={<FaUserGraduate/>} /></div>
          <div style={{gridColumn:'span 2'}}><MetricCard title="New Enrollments (7d)" value={metrics.enroll7 ?? 0} icon={<FaUserGraduate/>} /></div>
          <div style={{gridColumn:'span 2'}}><MetricCard title="Revenue (7d)" value={new Intl.NumberFormat('en-IN',{style:'currency', currency:'INR'}).format(Number(metrics.rev7||0))} icon={<FaBookOpen/>} /></div>
        </div>

        <div className="admin-grid" style={{marginTop:16}}>
          <div style={{gridColumn:'span 5'}}>
            <ListCompact title="Upcoming Classes" items={classes} renderRight={(it)=> <span className="admin-chip">{it.at}</span>} />
          </div>
          <div style={{gridColumn:'span 7'}}>
            <TableMini title="Recent Payments" columns={paymentCols} rows={payments.slice(0,5)} />
          </div>
        </div>

        <div style={{marginTop:16}}>
          <QuickActionsBar />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
