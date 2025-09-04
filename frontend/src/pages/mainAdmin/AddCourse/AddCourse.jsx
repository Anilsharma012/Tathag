// File: AddCourse.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout/AdminLayout";
import CourseForm from "./CourseForm/CourseForm";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";
import "./AddCourse.css";

const AddCourse = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data.courses);
    } catch (err) {
      console.error("❌ Failed to load courses", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEdit = (course) => {
    setEditCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("✅ Course deleted!");
      fetchCourses();
    } catch (err) {
      console.error("❌ Delete failed", err);
      alert("Something went wrong!");
    }
  };

  const handlePublish = async (courseId, currentStatus) => {
    const confirm = window.confirm(
      currentStatus
        ? "Unpublish this course from frontend?"
        : "Are you sure you want to publish this course?"
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `/api/courses/toggle-publish/${courseId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message);
      fetchCourses();
    } catch (err) {
      alert("❌ Failed to update publish status");
    }
  };

  return (
    <AdminLayout>
      <div className="adminCourse-wrapper">
        <div className="adminCourse-header">
          <h2 className="adminCourse-title">All Courses</h2>
          <button className="adminCourse-add-btn" onClick={() => setShowForm(true)}>
            ➕ Add Course
          </button>
        </div>

        {showForm && (
          <CourseForm
            editData={editCourse}
            onClose={() => {
              setShowForm(false);
              setEditCourse(null);
            }}
            onSuccess={() => {
              fetchCourses();
              setShowForm(false);
              setEditCourse(null);
            }}
          />
        )}

        <div className="adminCourse-grid">
          {courses.map((course, i) => (
            <div className="adminCourse-card" key={course._id}>
              <div className="adminCourse-image-wrap">
                <img
                  src={`/uploads/${course.thumbnail}`}
                  alt="Course Thumbnail"
                  className="adminCourse-image"
                />
                <div
                  className="adminCourse-publish-icon"
                  title={course.published ? "Published" : "Click to Publish"}
                  onClick={() => handlePublish(course._id, course.published)}
                >
                  {course.published ? (
                    <FaToggleOn color="#005ae0" size={22} />
                  ) : (
                    <FaToggleOff color="#ccc" size={22} />
                  )}
                </div>
              </div>
              <div className="adminCourse-card-body">
                <h3 className="adminCourse-name">{course.name}</h3>
                <div
                  className="adminCourse-description"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                ></div>
                <div className="adminCourse-card-footer">
                  <p className="adminCourse-price">₹{course.price}</p>
                  <p className="adminCourse-date">
                    Created: {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="adminCourse-actions">
                  <button
                    className="adminCourse-icon-btn edit"
                    onClick={() => handleEdit(course)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="adminCourse-icon-btn delete"
                    onClick={() => handleDelete(course._id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddCourse;
