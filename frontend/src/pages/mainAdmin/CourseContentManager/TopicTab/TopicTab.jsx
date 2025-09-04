import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./TopicTab.css";

const TopicTab = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [isFullTestSection, setIsFullTestSection] = useState(false);

  const [editingTopic, setEditingTopic] = useState(null);
  const [editTopicName, setEditTopicName] = useState("");
  const [editTopicDescription, setEditTopicDescription] = useState("");
  const [editFullTest, setEditFullTest] = useState(false);

  const token = localStorage.getItem("adminToken");

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const res = await axios.get("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data.courses || []);
    };
    fetchCourses();
  }, []);

  // Fetch subjects when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchSubjects = async () => {
      const res = await axios.get(`/api/subjects/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data.subjects || []);
    };
    fetchSubjects();
  }, [selectedCourse]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchChapters = async () => {
      const res = await axios.get(`/api/chapters/${selectedSubject}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters(res.data.chapters || []);
    };
    fetchChapters();
  }, [selectedSubject]);

  // Fetch topics when chapter changes
  useEffect(() => {
    if (!selectedChapter) return;
    fetchTopics(selectedChapter);
  }, [selectedChapter]);

  const fetchTopics = async (chapterId) => {
    const res = await axios.get(`/api/topics/${chapterId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTopics(res.data.topics || []);
  };

  const handleAddTopic = async () => {
    if (!selectedCourse || !selectedSubject || !selectedChapter || !topicName.trim()) {
      return alert("All fields are required");
    }

    await axios.post(
      "/api/topics",
      {
        course: selectedCourse,
        subject: selectedSubject,
        chapter: selectedChapter,
        name: topicName,
        description: topicDescription,
        isFullTestSection,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Topic added ✅");
    setTopicName("");
    setTopicDescription("");
    setIsFullTestSection(false);
    fetchTopics(selectedChapter);
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm("Delete this topic?")) return;
    await axios.delete(`/api/topics/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTopics(selectedChapter);
  };

  const handleUpdateTopic = async () => {
    await axios.put(
      `/api/topics/${editingTopic._id}`,
      {
        name: editTopicName,
        description: editTopicDescription,
        isFullTestSection: editFullTest,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Topic updated ✅");
    setEditingTopic(null);
    fetchTopics(selectedChapter);
  };

  return (
    <div className="topic-tab">
      <h3>📂 Topic Management</h3>

      <div className="form-group">
        <label>Select Course</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="form-group">
          <label>Select Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSubject && (
        <div className="form-group">
          <label>Select Chapter</label>
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}>
            <option value="">-- Select Chapter --</option>
            {chapters.map((ch) => (
              <option key={ch._id} value={ch._id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedChapter && (
        <>
          <div className="form-group">
            <label>Topic Name</label>
            <input value={topicName} onChange={(e) => setTopicName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
          <textarea
  placeholder="Enter topic description (optional)"
  value={topicDescription}
  onChange={(e) => setTopicDescription(e.target.value)}
/>

          </div>

          <div className="form-group checkbox">
            <label>
              <input type="checkbox" checked={isFullTestSection} onChange={() => setIsFullTestSection(!isFullTestSection)} />
              Is Full Test Section?
            </label>
          </div>

          <button className="add-btn" onClick={handleAddTopic}>
            ➕ Add Topic
          </button>

          <div className="table-wrapper">
            <h4>Topics List</h4>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Topic</th>
                  <th>Description</th>
                  <th>Full Test?</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t, i) => (
                  <tr key={t._id}>
                    <td>{i + 1}</td>
                    <td>{t.name}</td>
                    <td>{t.description}</td>
                    <td>{t.isFullTestSection ? "Yes" : "No"}</td>
                    <td className="icon-actions">
                      <FaEdit
                        onClick={() => {
                          setEditingTopic(t);
                          setEditTopicName(t.name);
                          setEditTopicDescription(t.description);
                          setEditFullTest(t.isFullTestSection);
                        }}
                      />
                      <FaTrash onClick={() => handleDeleteTopic(t._id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingTopic && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h4>Edit Topic</h4>
            <input value={editTopicName} onChange={(e) => setEditTopicName(e.target.value)} />
            <textarea value={editTopicDescription} onChange={(e) => setEditTopicDescription(e.target.value)} />
            <label>
              <input type="checkbox" checked={editFullTest} onChange={() => setEditFullTest(!editFullTest)} />
              Is Full Test Section?
            </label>
            <button onClick={handleUpdateTopic}>Update</button>
            <button onClick={() => setEditingTopic(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicTab;
