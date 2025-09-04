import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout/AdminLayout";
import axios from "axios";
import "./AllStudents.css";

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
const [editForm, setEditForm] = useState({
  name: "",
  email: "",
  phoneNumber: "",
  selectedCategory: "",
  selectedExam: "",
});


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("/api/admin/get-students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudents(res.data.students);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, []);


const handleEdit = (student) => {
  setEditingStudent(student);
  setEditForm({
    name: student.name || "",
    email: student.email || "",
    phoneNumber: student.phoneNumber || "",
    selectedCategory: student.selectedCategory || "",
    selectedExam: student.selectedExam || "",
  });
};

const handleUpdate = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.put(
      `/api/admin/update-student/${editingStudent._id}`,
      editForm,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updated = res.data.student;

    setStudents((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );
    alert("Student updated successfully!");
    setEditingStudent(null);
  } catch (error) {
    console.error("Update failed", error);
    alert("Failed to update student.");
  }
};

const handleDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to delete this student?");
  if (!confirm) return;

  try {
    const token = localStorage.getItem("adminToken");
    await axios.delete(`/api/admin/delete-student/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setStudents(prev => prev.filter(s => s._id !== id));
    alert("Student deleted successfully!");
  } catch (err) {
    console.error("Delete failed", err);
    alert("Something went wrong!");
  }
};




  return (
    <AdminLayout>
      <div className="students-page">
        <h1 className="page-title">All Registered Students</h1>
      
        <div className="student-table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Exam</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
           <tbody>
  {students.map((student, index) => (
    <tr key={student._id}>
      <td>{index + 1}</td>
      <td>{student.name}</td>
      <td>{student.email}</td>
      <td>{student.phoneNumber}</td>
      <td>{student.selectedCategory || '-'}</td>
      <td>{student.selectedExam || '-'}</td>
      <td>{new Date(student.createdAt).toLocaleDateString()}</td>
      <td className="action-icons">
        <button
          title="View"
          onClick={() => window.location.assign(`/admin/students/${student._id}`)}
          className="edit-btn"
        >
          👁️
        </button>
        <button
          title="Edit"
          onClick={() => handleEdit(student)}
          className="edit-btn"
        >
          ✏️
        </button>
        <button
          title="Delete"
          onClick={() => handleDelete(student._id)}
          className="delete-btn"
        >
          🗑️
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>

      {editingStudent && (
  <div className="edit-modal">
    <div className="edit-modal-content">
      <h2>Edit Student</h2>
      <label>Name:</label>
      <input
        type="text"
        value={editForm.name}
        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
      />
      <label>Email:</label>
      <input
        type="email"
        value={editForm.email}
        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
      />
      <label>Phone:</label>
      <input
        type="text"
        value={editForm.phoneNumber}
        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
      />
      <label>Category:</label>
      <input
        type="text"
        value={editForm.selectedCategory}
        onChange={(e) => setEditForm({ ...editForm, selectedCategory: e.target.value })}
      />
      <label>Exam:</label>
      <input
        type="text"
        value={editForm.selectedExam}
        onChange={(e) => setEditForm({ ...editForm, selectedExam: e.target.value })}
      />

      <div className="edit-actions">
        <button onClick={handleUpdate}>Update</button>
        <button className="cancel" onClick={() => setEditingStudent(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}

    </AdminLayout>
  );
};

export default AllStudents;
