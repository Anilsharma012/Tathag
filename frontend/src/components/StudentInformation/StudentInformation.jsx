import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentInformation.css";
import { FaArrowLeft, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StudentInformation = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [editIndex, setEditIndex] = useState(null); // ✅ Track Editing Row
    const [editedData, setEditedData] = useState({}); // ✅ Store Edited Values

    useEffect(() => {
        setLoading(true);
        axios
            .get("/api/v1/get-students")
            .then((response) => {
                setStudents(response.data.students);
                setLoading(false);
            })
            .catch((error) => {
                console.error("❌ Error fetching students:", error);
                setLoading(false);
            });
    }, []);

    // ✅ Enable Editing Mode
    const handleEdit = (index, student) => {
        setEditIndex(index);
        setEditedData({ ...student });
    };

    // ✅ Handle Input Change
    const handleChange = (e, field) => {
        setEditedData({ ...editedData, [field]: e.target.value });
    };

    // ✅ Cancel Edit
    const handleCancel = () => {
        setEditIndex(null);
        setEditedData({});
    };

    // ✅ Confirm Update with Notification
    const handleUpdate = async (studentId) => {
        const confirmUpdate = window.confirm("Do you really want to update this user?");
        if (confirmUpdate) {
            try {
                await axios.put(`/api/v1/update-student/${studentId}`, editedData);
                alert("✅ User updated successfully!");
                setStudents((prev) => prev.map((s) => (s._id === studentId ? editedData : s)));
                setEditIndex(null);
                setEditedData({});
            } catch (error) {
                console.error("❌ Error updating student:", error);
                alert("❌ Failed to update user.");
            }
        }
    };

    // ✅ Delete Function
    const handleDelete = async (studentId) => {
        const confirmDelete = window.confirm("⚠️ Do you really want to delete this user?");
        if (confirmDelete) {
            try {
                await axios.delete(`/api/v1/delete-student/${studentId}`);
                alert("✅ User deleted successfully!");
                setStudents((prev) => prev.filter((s) => s._id !== studentId));
            } catch (error) {
                console.error("❌ Error deleting student:", error);
                alert("❌ Failed to delete user.");
            }
        }
    };

    return (
        <div className="student-container">
            {/* ✅ Back Button */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <h2>📋 Student Information</h2>

            <div className="student-table-container">
                {/* ✅ Loading Spinner */}
                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : students.length > 0 ? (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>SrNo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Category</th>
                                <th>Exam</th>
                                <th>Registered</th>
                                <th>Action</th> {/* ✅ New Action Column */}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student._id}>
                                    <td>{index + 1}</td>

                                    {/* ✅ Inline Editing in TD */}
                                    <td>
                                        {editIndex === index ? (
                                            <input
                                                type="text"
                                                value={editedData.name}
                                                onChange={(e) => handleChange(e, "name")}
                                            />
                                        ) : (
                                            student.name || "N/A"
                                        )}
                                    </td>

                                    <td>
                                        {editIndex === index ? (
                                            <input
                                                type="text"
                                                value={editedData.email}
                                                onChange={(e) => handleChange(e, "email")}
                                            />
                                        ) : (
                                            student.email || "N/A"
                                        )}
                                    </td>

                                    <td>
                                        {editIndex === index ? (
                                            <input
                                                type="text"
                                                value={editedData.phoneNumber}
                                                onChange={(e) => handleChange(e, "phoneNumber")}
                                            />
                                        ) : (
                                            student.phoneNumber || "N/A"
                                        )}
                                    </td>

                                    <td>
                                        {editIndex === index ? (
                                            <input
                                                type="text"
                                                value={editedData.selectedCategory}
                                                onChange={(e) => handleChange(e, "selectedCategory")}
                                            />
                                        ) : (
                                            student.selectedCategory || "Not Selected"
                                        )}
                                    </td>

                                    <td>
                                        {editIndex === index ? (
                                            <input
                                                type="text"
                                                value={editedData.selectedExam}
                                                onChange={(e) => handleChange(e, "selectedExam")}
                                            />
                                        ) : (
                                            student.selectedExam || "Not Selected"
                                        )}
                                    </td>

                                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>

                                    {/* ✅ Action Column - Edit & Delete */}
                                    <td>
                                        {editIndex === index ? (
                                            <>
                                                <FaCheck className="icon update" onClick={() => handleUpdate(student._id)} />
                                                <FaTimes className="icon cancel" onClick={handleCancel} />
                                            </>
                                        ) : (
                                            <>
                                                <FaEdit className="icon edit" onClick={() => handleEdit(index, student)} />
                                                <FaTrash className="icon delete" onClick={() => handleDelete(student._id)} />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No students found</p>
                )}
            </div>
        </div>
    );
};

export default StudentInformation;
