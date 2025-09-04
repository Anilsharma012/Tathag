// AllTeachers.jsx (Now with Edit & Delete)

import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout/AdminLayout";
import axios from "axios";
import "./AllTeachers.css";
import { Dialog } from "@headlessui/react";
import { FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

const AllTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/subadmin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.subAdmins);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateOrUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("adminToken");

    try {
      if (editingId) {
        await axios.put(`/api/subadmin/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/subadmin/create", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsOpen(false);
      setForm({ name: "", email: "", password: "" });
      setEditingId(null);
      fetchTeachers();
    } catch (err) {
      alert("Failed: " + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setForm({ name: teacher.name, email: teacher.email });
    setEditingId(teacher._id);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure to delete this SubAdmin?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/subadmin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeachers();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="teachers-page">
        <div className="page-header">
          <h1 className="page-title">All SubAdmins</h1>
          <button className="create-btn" onClick={() => setIsOpen(true)}>
            <FaPlus /> Create SubAdmin
          </button>
        </div>

        <div className="teacher-table-wrapper">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher._id}>
                  <td>{index + 1}</td>
                  <td>{teacher.name || "-"}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.isActive ? "Active" : "Inactive"}</td>
                  <td>{
                    teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "-"
                  }</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(teacher)}>
                      <FaEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(teacher._id)}>
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={isOpen} onClose={() => {
          setIsOpen(false);
          setForm({ name: "", email: "", password: "" });
          setEditingId(null);
        }} className="dialog">
          <div className="dialog-overlay" />
          <div className="dialog-content">
            <Dialog.Title className="dialog-title">
              {editingId ? "Edit SubAdmin" : "Create New SubAdmin"}
            </Dialog.Title>
            <input name="name" value={form.name} onChange={handleInput} placeholder="Name" className="dialog-input" />
            <input name="email" value={form.email} onChange={handleInput} placeholder="Email" className="dialog-input" />
            {!editingId && (
              <input name="password" value={form.password} onChange={handleInput} placeholder="Password" type="password" className="dialog-input" />
            )}
            <div className="dialog-actions">
              <button onClick={() => setIsOpen(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleCreateOrUpdate} disabled={loading} className="submit-btn">
                {loading ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AllTeachers;
