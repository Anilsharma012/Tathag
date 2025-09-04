import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import './crm.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminStudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // fetch all students then pick one (no single endpoint available)
        const studentsRes = await axios.get('/api/admin/get-students', { headers: { Authorization: `Bearer ${token}` }});
        const s = (studentsRes.data.students || []).find(u => u._id === id) || null;
        setStudent(s);

        // fetch student's enrollments with purchases data for course details
        const paidRes = await axios.get('/api/admin/paid-users', { headers: { Authorization: `Bearer ${token}` }});
        const fullUser = (paidRes.data.users || []).find(u => u._id === id) || null;
        const enrolled = (fullUser?.enrolledCourses || []).filter(ec => ec.status === 'unlocked' && ec.courseId);
        setEnrollments(enrolled);

        // load progress for each course via admin endpoints
        for (const ec of enrolled) {
          const courseId = ec.courseId._id;
          const res = await axios.get(`/api/admin/student/${id}/course/${courseId}/progress`, { headers: { Authorization: `Bearer ${token}` }});
          const percent = res.data?.progress?.overallProgress ?? 0;
          setProgressMap(prev => ({ ...prev, [courseId]: Number(percent)}));
        }
      } catch (e) {
        toast.error('Failed to load student');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const toggleLesson = async (courseId, lessonId, lessonType, makeCompleted) => {
    try {
      await axios.put(`/api/admin/student/${id}/course/${courseId}/lesson`, {
        lessonId, lessonType, status: makeCompleted ? 'completed' : 'not_started', progress: makeCompleted ? 100 : 0
      }, { headers: { Authorization: `Bearer ${token}` }});
      const res = await axios.get(`/api/admin/student/${id}/course/${courseId}/progress`, { headers: { Authorization: `Bearer ${token}` }});
      const percent = res.data?.progress?.overallProgress ?? 0;
      setProgressMap(prev => ({ ...prev, [courseId]: Number(percent)}));
      toast.success('Updated');
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  return (
    <AdminLayout>
      <div className="crm-container">
        <div className="crm-header"><h1>Student Detail</h1></div>
        {loading ? <div className="skeleton"/> : !student ? (
          <div>No student found</div>
        ) : (
          <>
            <div className="overview-grid">
              <div>
                <h3>Profile</h3>
                <p><strong>{student.name || '-'}</strong></p>
                <p>{student.email || '-'}</p>
                <p>{student.phoneNumber || '-'}</p>
              </div>
              <div>
                <h3>Preferences</h3>
                <p>Category: {student.selectedCategory || '-'}</p>
                <p>Exam: {student.selectedExam || '-'}</p>
              </div>
            </div>

            <h2 style={{marginTop:16}}>Courses</h2>
            <div className="table-wrapper">
              <table className="crm-table">
                <thead><tr><th>Course</th><th>Progress</th><th>Actions</th></tr></thead>
                <tbody>
                  {enrollments.map(ec => (
                    <tr key={ec._id}>
                      <td>{ec.courseId?.name || ec.courseId}</td>
                      <td>
                        <div className="course-progress">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{width: `${Math.round(progressMap[ec.courseId._id] || 0)}%`}}></div>
                          </div>
                          <span className="progress-text">{Math.round(progressMap[ec.courseId._id] || 0)}% Complete</span>
                        </div>
                      </td>
                      <td>
                        <button className="link" onClick={()=>toggleLesson(ec.courseId._id, 'demo-lesson', 'video', true)}>Mark a demo lesson complete</button>
                        <button className="link" onClick={()=>toggleLesson(ec.courseId._id, 'demo-lesson', 'video', false)}>Reset demo lesson</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStudentDetail;
