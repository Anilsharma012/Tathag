import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AddTest.css";

const AddTest = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [tests, setTests] = useState([]);
  const [editingTestId, setEditingTestId] = useState(null);



  const token = localStorage.getItem("adminToken");

  // 🔹 Fetch all courses
  useEffect(() => {
    axios.get("/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setCourses(res.data.courses || []))
    .catch(err => console.error("Course load error", err));
  }, []);

  // 🔹 Fetch subjects based on course
  useEffect(() => {
    if (!course) return;
    axios.get(`/api/subjects/${course}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setSubjects(res.data.subjects || []))
    .catch(err => console.error("Subject load error", err));
  }, [course]);

  // 🔹 Fetch chapters based on subject
  useEffect(() => {
    if (!subject) return;
    axios.get(`/api/chapters/${subject}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setChapters(res.data.chapters || []))
    .catch(err => console.error("Chapter load error", err));
  }, [subject]);

  // 🔹 Fetch topics based on chapter
  useEffect(() => {
    if (!chapter) return;
    axios.get(`/api/topics/${chapter}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setTopics(res.data.topics || []))
    .catch(err => console.error("Topic load error", err));
  }, [chapter]);



 const handleSubmit = async () => {
  if (!course || !subject || !chapter || !topic || !title || !duration || !totalMarks) {
    return alert("❌ Please fill all required fields");
  }

  const testData = {
    course,
    subject,
    chapter,
    topic,
    title,
    description,
    duration,
    totalMarks,
    instructions,
  };

  try {
    const token = localStorage.getItem("adminToken");

    if (editingTestId) {
      // ✅ Update
      await axios.put(`/api/tests/${editingTestId}`, testData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Test Updated!");
    } else {
      // ✅ Create
      await axios.post("/api/tests", testData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Test Created Successfully!");
    }

    // Reset
    setEditingTestId(null);
    setTitle("");
    setDescription("");
    setInstructions("");
    setDuration("");
    setTotalMarks("");
    setTopic("");

    // Refresh list
    const res = await axios.get(`/api/tests/${topic}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTests(res.data.tests || []);
  } catch (err) {
    console.error("❌ Submit error:", err);
    alert("Failed to submit");
  }
};



useEffect(() => {
  if (!topic) return;
  const token = localStorage.getItem("adminToken");
  axios
    .get(`/api/tests/${topic}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setTests(res.data.tests || []))
    .catch((err) => console.error("❌ Fetch test error", err));
}, [topic]);

const handleEdit = (test) => {
  setEditingTestId(test._id);
  setCourse(test.course);
  setSubject(test.subject);
  setChapter(test.chapter);
  setTopic(test.topic);
  setTitle(test.title);
  setDescription(test.description || "");
  setInstructions(test.instructions || "");
  setDuration(test.duration);
  setTotalMarks(test.totalMarks);
};


const handleDelete = async (id) => {
  if (!window.confirm("❌ Are you sure you want to delete this test?")) return;
  try {
    const token = localStorage.getItem("adminToken");
    await axios.delete(`/api/tests/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTests((prev) => prev.filter((t) => t._id !== id));
    alert("✅ Test deleted");
  } catch (err) {
    console.error("Delete failed", err);
    alert("❌ Delete failed");
  }
};



  return (
    <div className="add-test-container">
      <h2>Create New Test</h2>

      <div className="form-group">
        <label>Course</label>
        <select value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {course && (
        <div className="form-group">
          <label>Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {subject && (
        <div className="form-group">
          <label>Chapter</label>
          <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
            <option value="">-- Select Chapter --</option>
            {chapters.map((ch) => (
              <option key={ch._id} value={ch._id}>{ch.name}</option>
            ))}
          </select>
        </div>
      )}

      {chapter && (
        <div className="form-group">
          <label>Topic</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">-- Select Topic --</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {topic && (
        <>
          <div className="form-group">
            <label>Test Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. CAT Verbal Quiz 1" />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>

          <div className="form-group">
            <label>Instructions (optional)</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}></textarea>
          </div>

          <div className="form-group">
            <label>Duration (in minutes)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Total Marks</label>
            <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
          </div>
        </>
      )}

      {/* Button will work in next step */}
      <button className="submit-btn" onClick={handleSubmit}>
 {editingTestId ? "✏️ Update Test" : "🚀 Create Test"}

</button>

{tests.length > 0 && (
  <div className="table-wrapper">
    <h3>📄 Existing Tests in this Topic</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Duration</th>
          <th>Marks</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tests.map((test, i) => (
          <tr key={test._id}>
            <td>{i + 1}</td>
            <td>{test.title}</td>
            <td>{test.duration} min</td>
            <td>{test.totalMarks}</td>
            <td>
              <button onClick={() => handleEdit(test)}>✏️</button>
              <button onClick={() => handleDelete(test._id)}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>

    



  );

 

};

export default AddTest;
