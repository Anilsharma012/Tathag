import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./ChapterTab.css"

const ChapterTab = ({ selectedCourseId }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [chapters, setChapters] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [editingChapter, setEditingChapter] = useState(null);
  const [editChapterName, setEditChapterName] = useState("");



const fetchChapters = async (subjectId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await axios.get(`/api/chapters/${subjectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setChapters(res.data.chapters || []);
  } catch (err) {
    console.error("Failed to load chapters", err);
  }
};


    useEffect(() => {
  if (selectedSubjectId) {
    fetchChapters(selectedSubjectId);
  }
}, [selectedSubjectId]);


  // ✅ Load subjects for selected course
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`/api/subjects/${selectedCourseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    };
    if (selectedCourseId) {
      fetchSubjects();
    }
  }, [selectedCourseId]);

  // ✅ Load chapters when subject selected


  // ✅ Add chapter
  const handleAddChapter = async () => {
    if (!chapterName || !selectedSubjectId) return alert("Please select subject and enter chapter name");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("/api/chapters", {
        courseId: selectedCourseId,
        subjectId: selectedSubjectId,
        name: chapterName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Chapter added ✅");
      fetchChapters(selectedSubjectId);
      setChapterName("");

      
      
    } catch (err) {
      console.error("Failed to add chapter", err);
      alert("Chapter not added");
    }
  };

  // ✅ Delete chapter
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/chapters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ✅ Update chapter
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`/api/chapters/${editingChapter._id}`, {
        name: editChapterName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Chapter updated ✅");
      setEditingChapter(null);
      setEditChapterName("");
     fetchChapters(selectedSubjectId);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="chapter-tab">
      <h3>📘 Chapter Management</h3>

      {/* Subject Dropdown */}
      <div className="form-group">
        <label>Select Subject</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Chapter */}
      {selectedSubjectId && (
        <>
          <div className="form-group">
            <label>New Chapter Name</label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
            />
            <button className="add-btn" onClick={handleAddChapter}>➕ Add Chapter</button>
          </div>

          <div className="table-wrapper">
            <h4>Chapter List</h4>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Chapter</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((ch, index) => (
                  <tr key={ch._id}>
                    <td>{index + 1}</td>
                    <td>{ch.name}</td>
                    <td className="icon-actions">
                      <FaEdit
                        title="Edit"
                        style={{ cursor: "pointer", marginRight: "10px", color: "#007bff" }}
                        onClick={() => {
                          setEditingChapter(ch);
                          setEditChapterName(ch.name);
                        }}
                      />
                      <FaTrash
                        title="Delete"
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => handleDelete(ch._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Chapter Modal */}
      {editingChapter && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h4>Edit Chapter</h4>
            <input
              type="text"
              value={editChapterName}
              onChange={(e) => setEditChapterName(e.target.value)}
            />
            <button onClick={handleUpdate}>Update</button>
            <button onClick={() => setEditingChapter(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterTab;
