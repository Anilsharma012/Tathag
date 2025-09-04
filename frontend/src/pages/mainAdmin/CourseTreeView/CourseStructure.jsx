import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./CourseStructure.css";
import ReactModal from "react-modal";

const CourseStructure = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    axios
      .get(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourse(res.data.course))
      .catch((err) => console.error("Failed to load course:", err));

    axios
      .get(`/api/subjects/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSubjects(res.data.subjects || []);
        if (res.data.subjects?.length > 0) setActiveSubject(res.data.subjects[0]._id);
      })
      .catch((err) => console.error("Failed to load subjects:", err));
  }, [courseId]);

  useEffect(() => {
    if (!activeSubject) return;
    axios
      .get(`/api/chapters/${activeSubject}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setChapters(res.data.chapters || []))
      .catch((err) => console.error("Failed to load chapters:", err));
  }, [activeSubject]);

  return (
    <AdminLayout>
      <div className="tz-container">
        <h1 className="tz-heading">📚 {course?.name} - Structure</h1>

        <div className="tz-subject-tabs">
          {subjects.map((sub) => (
            <button
              key={sub._id}
              onClick={() => setActiveSubject(sub._id)}
              className={`tz-subject-tab ${activeSubject === sub._id ? "active" : ""}`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {chapters.length > 0 ? (
          <div className="tz-chapters-grid">
            {chapters.map((ch) => (
              <ChapterCard
                key={ch._id}
                chapter={ch}
                course={course}
                subject={subjects.find((s) => s._id === activeSubject)}
              />
            ))}
          </div>
        ) : (
          <div className="tz-no-chapters">No chapters available for this subject.</div>
        )}
      </div>
    </AdminLayout>
  );
};

const ChapterCard = ({ chapter, course, subject }) => {
  const [topics, setTopics] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const token = localStorage.getItem("adminToken");

  const fetchTopics = () => {
    axios
      .get(`/api/topics/${chapter._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTopics(res.data.topics || []))
      .catch((err) => console.error("❌ Failed to load topics:", err));
  };

  const handleToggle = (e) => {
    setExpanded(e.target.open);
    if (!expanded) fetchTopics();
  };

  return (
    <details className="tz-chapter-card" onToggle={handleToggle}>
      <summary>{chapter.name}</summary>
      <div className="tz-chapter-content">
        <p className="tz-chapter-path">
          Under {course?.name} / {subject?.name}
        </p>

        {topics.length > 0 ? (
          <ul className="tz-topic-list">
            {topics.map((topic) => (
              <li key={topic._id} className="tz-topic-item">
                📗 {topic.name}
                <TestList topicId={topic._id} />
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "12px", color: "#888" }}>No topics found.</p>
        )}
      </div>
    </details>
  );
};

const TestList = ({ topicId }) => {
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    axios
      .get(`/api/tests/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTests(res.data.tests || []))
      .catch((err) => console.error("❌ Failed to load tests:", err));
  }, [topicId]);

  const openTest = async (testId) => {
    try {
      const res = await axios.get(`/api/questions/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data.questions || []);
      setSelectedTestId(testId);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
    }
  };

  return (
    <>
      <ul className="tz-test-list">
        {tests.map((test) => (
          <li
            key={test._id}
            className="tz-test-item"
            onClick={() => openTest(test._id)}
          >
            🧪 {test.title}
          </li>
        ))}
      </ul>

      {/* Modal View */}
      {showModal && (
        <div className="tz-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tz-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="tz-modal-title">🧪 Questions</h3>
            <button className="tz-modal-close" onClick={() => setShowModal(false)}>
              ❌
            </button>
            <div className="tz-question-scroll">
              {questions.length > 0 ? questions.map((q, idx) => {
                // Safety check for question object
                if (!q || !q._id) {
                  return (
                    <div key={`error-${idx}`} className="tz-question-block">
                      <div className="tz-question-text" style={{color: "#ff6b6b"}}>
                        ⚠️ Question data is malformed
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={q._id} className="tz-question-block">
                    <div className="tz-question-text">
                      <strong>Q{idx + 1}:</strong>{" "}
                      <span dangerouslySetInnerHTML={{ __html: q.questionText || "No question text" }} />
                    </div>
                    {q.image && <img src={`/uploads/${q.image}`} alt="question-img" className="tz-question-image" />}
                    <ul className="tz-options-list">
                      {q.options && typeof q.options === 'object' && !Array.isArray(q.options) ? (
                        // Handle new object-based options format {A: "text", B: "text", ...}
                        Object.entries(q.options).map(([key, value]) => (
                          <li
                            key={key}
                            className={`tz-option-item ${q.correctOption === key ? "correct" : ""}`}
                          >
                            {key}. <span dangerouslySetInnerHTML={{ __html: value || "No option text" }} />
                          </li>
                        ))
                      ) : q.options && Array.isArray(q.options) ? (
                        // Handle legacy array-based options format ["text1", "text2", ...]
                        q.options.map((opt, i) => (
                          <li
                            key={i}
                            className={`tz-option-item ${q.correctOptionIndex === i ? "correct" : ""}`}
                          >
                            {i + 1}. <span dangerouslySetInnerHTML={{ __html: opt || "No option text" }} />
                          </li>
                        ))
                      ) : (
                        <li className="tz-option-item">No options available</li>
                      )}
                    </ul>
                    {q.explanation && (
                      <div className="tz-explanation">
                        <strong>Explanation:</strong>{" "}
                        <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                      </div>
                    )}
                    {/* Debug info */}
                    <div style={{fontSize: "10px", color: "#888", marginTop: "5px"}}>
                      Difficulty: {q.difficulty || "N/A"} | Marks: {q.marks || "N/A"}
                    </div>
                  </div>
                );
              }) : (
                <div className="tz-no-questions">No questions found for this test.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseStructure;
