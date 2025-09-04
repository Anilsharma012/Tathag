import React, { useEffect, useState, } from "react";
import AdminLayout from "../AdminLayout/AdminLayout";
import axios from "axios";
import { Link } from "react-router-dom"; 
import "./CourseTreeView.css";

const CourseTreeView = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data.courses || []))
      .catch((err) => console.error("❌ Failed to load courses:", err));
  }, []);

  return (
    <AdminLayout>
      <div className="tc-course-tree-container">
        <h2 className="tc-course-tree-title">📚 Course Content Structure</h2>
        <div className="tc-course-grid">
          {courses.map((course) => (
            console.log("🖼️ Image Path:", course.image), // ✅ Add this line here
  console.log("📦 Full Course Object:", course),
            <div key={course._id} className="tc-course-card">
              <img
  src={
    course.thumbnail
      ? `/uploads/${course.thumbnail}`
      : "/default-course.png"
  }
  alt={course.name}
  className="tc-course-image"
/>


              <div className="tc-course-info">
                <h3 className="tc-course-name">{course.name}</h3>
                <div
                  className="tc-course-desc"
                  dangerouslySetInnerHTML={{
                    __html: course.description || "No description available.",
                  }}
                ></div>
                <div className="tc-course-meta">
                  <span className="tc-course-price">₹{course.price || 0}</span>
                </div>
              </div>
           <details className="tc-course-details">
  <summary>
  <Link to={`/admin/courses/${course._id}/structure`} className="tc-view-structure-link">

      📂 View Structure
    </Link>
  </summary>
</details>

            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

const SubjectTree = ({ courseId }) => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get(`/api/subjects/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubjects(res.data.subjects || []))
      .catch((err) => console.error("❌ Failed to load subjects:", err));
  }, [courseId]);

  return (
    <div className="tc-subject-tree">
      {subjects.map((subject) => (
        <details key={subject._id} className="tc-subject-block">
          <summary className="tc-subject-name">{subject.name}</summary>
          <ChapterTree subjectId={subject._id} />
        </details>
      ))}
    </div>
  );
};

const ChapterTree = ({ subjectId }) => {
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get(`/api/chapters/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setChapters(res.data.chapters || []))
      .catch((err) => console.error("❌ Failed to load chapters:", err));
  }, [subjectId]);

  return (
    <div className="tc-chapter-tree">
      {chapters.map((chapter) => (
        <details key={chapter._id} className="tc-chapter-block">
          <summary className="tc-chapter-name">{chapter.name}</summary>
          <TopicTree chapterId={chapter._id} />
        </details>
      ))}
    </div>
  );
};

const TopicTree = ({ chapterId }) => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get(`/api/topics/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTopics(res.data.topics || []))
      .catch((err) => console.error("❌ Failed to load topics:", err));
  }, [chapterId]);

  return (
    <div className="tc-topic-tree">
      {topics.map((topic) => (
        <details key={topic._id} className="tc-topic-block">
          <summary className="tc-topic-name">{topic.name}</summary>
          <TestTree topicId={topic._id} />
        </details>
      ))}
    </div>
  );
};

const TestTree = ({ topicId }) => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get(`/api/tests/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTests(res.data.tests || []))
      .catch((err) => console.error("❌ Failed to load tests:", err));
  }, [topicId]);

  return (
    <ul className="tc-test-tree">
      {tests.map((test) => (
        <li key={test._id} className="tc-test-item">
          <details>
            <summary>🧪 {test.title}</summary>
            <QuestionTree testId={test._id} />
          </details>
        </li>
      ))}
    </ul>
  );
};

const QuestionTree = ({ testId }) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    axios
      .get(`/api/questions/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setQuestions(res.data.questions || []))
      .catch((err) => console.error("❌ Failed to load questions:", err));
  }, [testId]);

  return (
    <ul className="tc-question-tree">
      {questions.map((q, index) => (
        <li key={q._id} className="tc-question-item">
          <strong>Q{index + 1}:</strong> {q.questionText}
          <ul>
            {q.options?.map((opt, i) => (
              <li key={i} className="tc-option-item">
                {i + 1}. {opt} {q.correctOptionIndex === i ? "✅" : ""}
              </li>
            ))}
            {q.explanation && (
              <li className="tc-explanation">
                <strong>Explanation:</strong> {q.explanation}
              </li>
            )}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default CourseTreeView;
