import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageInstructors.css";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const ManageInstructors = () => {
    const [subadmins, setSubadmins] = useState([]);
    const [formData, setFormData] = useState({ name: "", email: "", phoneNumber: "" });
    const [editIndex, setEditIndex] = useState(null); // ✅ Track Editing Row
    const [editedData, setEditedData] = useState({}); // ✅ Store Edited Values

    useEffect(() => {
        fetchSubadmins();
    }, []);

    // ✅ Fetch Subadmins
    const fetchSubadmins = async () => {
        try {
            const response = await axios.get("/api/v1/get-subadmins");
            setSubadmins(response.data.subAdmins);
        } catch (error) {
            console.error("❌ Error fetching subadmins:", error);
        }
    };

    // ✅ Handle Input Change
    const handleChange = (e, field) => {
        setEditedData({ ...editedData, [field]: e.target.value });
    };

    // ✅ Create Subadmin
    const handleCreateSubadmin = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/v1/create-subadmin", formData);
            alert("✅ Subadmin created successfully!");
            fetchSubadmins();
            setFormData({ name: "", email: "", phoneNumber: "" });
        } catch (error) {
            console.error("❌ Error creating subadmin:", error);
            alert("❌ Failed to create subadmin.");
        }
    };

    // ✅ Enable Editing Mode
    const handleEdit = (index, subadmin) => {
        setEditIndex(index);
        setEditedData({ ...subadmin });
    };

    // ✅ Cancel Edit
    const handleCancel = () => {
        setEditIndex(null);
        setEditedData({});
    };

    // ✅ Confirm Update with Notification
    const handleUpdate = async (subadminId) => {
        const confirmUpdate = window.confirm("Do you really want to update this subadmin?");
        if (confirmUpdate) {
            try {
                await axios.put(`/api/v1/update-subadmin/${subadminId}`, editedData);
                alert("✅ Subadmin updated successfully!");
                fetchSubadmins();
                setEditIndex(null);
                setEditedData({});
            } catch (error) {
                console.error("❌ Error updating subadmin:", error);
                alert("❌ Failed to update subadmin.");
            }
        }
    };

    // ✅ Delete Function
    const handleDelete = async (subadminId) => {
        const confirmDelete = window.confirm("⚠️ Do you really want to delete this subadmin?");
        if (confirmDelete) {
            try {
                await axios.delete(`/api/v1/delete-subadmin/${subadminId}`);
                alert("✅ Subadmin deleted successfully!");
                setSubadmins((prev) => prev.filter((s) => s._id !== subadminId));
            } catch (error) {
                console.error("❌ Error deleting subadmin:", error);
                alert("❌ Failed to delete subadmin.");
            }
        }
    };

    return (
        <div className="manage-instructors-container">
            {/* ✅ Left Side - Create Subadmin Form */}
            <div className="subadmin-form">
                <h2>Create Subadmin</h2>
                <form onSubmit={handleCreateSubadmin}>
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} required />
                    <button type="submit">Create Subadmin</button>
                </form>
            </div>

            {/* ✅ Right Side - Subadmins List */}
            <div className="subadmin-list">
                <h2>Subadmins List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th> {/* ✅ New Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {subadmins.length > 0 ? (
                            subadmins.map((subadmin, index) => (
                                <tr key={subadmin._id}>
                                      <td>{index + 1}</td> {/* ✅ Serial Number */}
                                    <td>
                                        {editIndex === index ? (
                                            <input type="text" value={editedData.name} onChange={(e) => handleChange(e, "name")} />
                                        ) : (
                                            subadmin.name
                                        )}
                                    </td>

                                    <td>
                                        {editIndex === index ? (
                                            <input type="text" value={editedData.email} onChange={(e) => handleChange(e, "email")} />
                                        ) : (
                                            subadmin.email
                                        )}
                                    </td>

                                    <td>
                                        {editIndex === index ? (
                                            <input type="text" value={editedData.phoneNumber} onChange={(e) => handleChange(e, "phoneNumber")} />
                                        ) : (
                                            subadmin.phoneNumber
                                        )}
                                    </td>

                                    {/* ✅ Actions Column */}
                                    <td>
                                        {editIndex === index ? (
                                            <>
                                                <FaCheck className="icon update" onClick={() => handleUpdate(subadmin._id)} />
                                                <FaTimes className="icon cancel" onClick={handleCancel} />
                                            </>
                                        ) : (
                                            <>
                                                <FaEdit className="icon edit" onClick={() => handleEdit(index, subadmin)} />
                                                <FaTrash className="icon delete" onClick={() => handleDelete(subadmin._id)} />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">No Subadmins Found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageInstructors;
