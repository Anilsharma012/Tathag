import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentCourseContentManager.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const StudentCourseContentManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedTestId, setSelectedTestId] = useState("");
  const [activeTab, setActiveTab] = useState("subjects");
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [publishedCourse, setPublishedCourse] = useState(null);

  // Fetch course data on component mount
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const res = await axios.get(`/api/student/course/${courseId}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data.course);
        setSubjects(res.data.subjects || []);
        setLoading(false);
      } catch (error) {
        if (error?.response?.status === 403) {
          try {
            const pub = await axios.get(`/api/courses/student/published-courses/${courseId}`);
            setPublishedCourse(pub.data?.course || null);
            setCourse(pub.data?.course || null);
            setLocked(true);
          } catch (_) {}
        }
        console.error("Error fetching course data", error);
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Fetch chapters when subject is selected
  useEffect(() => {
    if (!selectedSubjectId || locked) return;
    
    const fetchChapters = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const res = await axios.get(`/api/student/subject/${selectedSubjectId}/chapters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChapters(res.data.chapters || []);
      } catch (error) {
        console.error("Error fetching chapters", error);
      }
    };
    
    fetchChapters();
  }, [selectedSubjectId]);

  // Fetch topics when chapter is selected
  useEffect(() => {
    if (!selectedChapterId || locked) return;
    
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const res = await axios.get(`/api/student/chapter/${selectedChapterId}/topics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopics(res.data.topics || []);
      } catch (error) {
        console.error("Error fetching topics", error);
      }
    };
    
    fetchTopics();
  }, [selectedChapterId]);

  // Fetch tests when topic is selected
  useEffect(() => {
    if (!selectedTopicId || locked) return;
    
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const res = await axios.get(`/api/student/topic/${selectedTopicId}/tests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTests(res.data.tests || []);
      } catch (error) {
        console.error("Error fetching tests", error);
      }
    };
    
    fetchTests();
  }, [selectedTopicId]);

  // Fetch questions when test is selected
  useEffect(() => {
    if (!selectedTestId) return;
    // Questions are accessible within the test interface; skip admin-only endpoint here
    setQuestions([]);
  }, [selectedTestId]);

  if (loading) {
    return <div className="loading">Loading course content...</div>;
  }

  if (!course) {
    return <div className="error">Course not found</div>;
  }

  if (locked) {
    return (
      <div className="student-content-manager">
        <div className="header">
          <h2 className="page-title">🔒 Course Locked</h2>
          <p className="course-description">You need to purchase/unlock this course to view its schedule and content.</p>
        </div>
        {publishedCourse && (
          <div className="locked-course-card">
            <h3>{publishedCourse.name}</h3>
            <p>{publishedCourse.description}</p>
            <div style={{display:'flex',gap:12}}>
              <button className="continue-btn primary" onClick={()=>navigate('/course-purchase', { state: { ...publishedCourse }})}>Buy Course</button>
              <button className="info-btn" onClick={()=>navigate('/student')}>Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="student-content-manager">
      <div className="header">
        <h2 className="page-title">📚 Course Content: {course.name}</h2>
        <p className="course-description">{course.description}</p>
      </div>

      {/* Tabs for different content types */}
      <div className="tab-buttons">
        <button
          className={activeTab === "subjects" ? "active-tab" : ""}
          onClick={() => setActiveTab("subjects")}
        >
          Subjects ({subjects.length})
        </button>
        <button
          className={activeTab === "chapters" ? "active-tab" : ""}
          onClick={() => setActiveTab("chapters")}
        >
          Chapters ({chapters.length})
        </button>
        <button
          className={activeTab === "topics" ? "active-tab" : ""}
          onClick={() => setActiveTab("topics")}
        >
          Topics ({topics.length})
        </button>
        <button
          className={activeTab === "tests" ? "active-tab" : ""}
          onClick={() => setActiveTab("tests")}
        >
          Tests ({tests.length})
        </button>
        <button
          className={activeTab === "questions" ? "active-tab" : ""}
          onClick={() => setActiveTab("questions")}
        >
          Questions ({questions.length})
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="tab-content">
        {activeTab === "subjects" && (
          <div className="subjects-section">
            <h3>Subjects in this Course</h3>
            {subjects.length > 0 ? (
              <div className="content-grid">
                {subjects.map((subject) => (
                  <div 
                    key={subject._id} 
                    className={`content-card ${selectedSubjectId === subject._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSubjectId(subject._id);
                      setActiveTab("chapters");
                    }}
                  >
                    <h4>{subject.name}</h4>
                    <p>Click to view chapters</p>
                    <div className="card-meta">
                      <span>Created: {new Date(subject.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-content">No subjects available for this course.</p>
            )}
          </div>
        )}

        {activeTab === "chapters" && (
          <div className="chapters-section">
            <div className="section-header">
              <h3>Chapters</h3>
              <div className="form-group">
                <label>Select Subject:</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedSubjectId && chapters.length > 0 ? (
              <div className="content-grid">
                {chapters.map((chapter) => (
                  <div 
                    key={chapter._id} 
                    className={`content-card ${selectedChapterId === chapter._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedChapterId(chapter._id);
                      setActiveTab("topics");
                    }}
                  >
                    <h4>{chapter.name}</h4>
                    <p>Click to view topics</p>
                    <div className="card-meta">
                      <span>Created: {new Date(chapter.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedSubjectId ? (
              <p className="no-content">No chapters available for the selected subject.</p>
            ) : (
              <p className="no-content">Please select a subject to view chapters.</p>
            )}
          </div>
        )}

        {activeTab === "topics" && (
          <div className="topics-section">
            <div className="section-header">
              <h3>Topics</h3>
              <div className="form-group">
                <label>Select Chapter:</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                >
                  <option value="">-- Select Chapter --</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedChapterId && topics.length > 0 ? (
              <div className="content-grid">
                {topics.map((topic) => (
                  <div 
                    key={topic._id} 
                    className={`content-card ${selectedTopicId === topic._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedTopicId(topic._id);
                      setActiveTab("tests");
                    }}
                  >
                    <h4>{topic.name}</h4>
                    {topic.description && <p>{topic.description}</p>}
                    {topic.isFullTestSection && <span className="badge">Full Test Section</span>}
                    <p>Click to view tests</p>
                    <div className="card-meta">
                      <span>Created: {new Date(topic.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedChapterId ? (
              <p className="no-content">No topics available for the selected chapter.</p>
            ) : (
              <p className="no-content">Please select a chapter to view topics.</p>
            )}
          </div>
        )}

        {activeTab === "tests" && (
          <div className="tests-section">
            <div className="section-header">
              <h3>Tests</h3>
              <div className="form-group">
                <label>Select Topic:</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                >
                  <option value="">-- Select Topic --</option>
                  {topics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedTopicId && tests.length > 0 ? (
              <div className="content-grid">
                {tests.map((test) => (
                  <div 
                    key={test._id} 
                    className={`content-card ${selectedTestId === test._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedTestId(test._id);
                      setActiveTab("questions");
                    }}
                  >
                    <h4>{test.title}</h4>
                    {test.description && <p>{test.description}</p>}
                    <div className="test-details">
                      <span className="duration">⏱️ {test.duration} min</span>
                      <span className="marks">📊 {test.totalMarks} marks</span>
                    </div>
                    <p>Click to view questions</p>
                    <div className="card-meta">
                      <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedTopicId ? (
              <p className="no-content">No tests available for the selected topic.</p>
            ) : (
              <p className="no-content">Please select a topic to view tests.</p>
            )}
          </div>
        )}

        {activeTab === "questions" && (
          <div className="questions-section">
            <div className="section-header">
              <h3>Questions</h3>
              <div className="form-group">
                <label>Select Test:</label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                >
                  <option value="">-- Select Test --</option>
                  {tests.map((test) => (
                    <option key={test._id} value={test._id}>
                      {test.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedTestId && questions.length > 0 ? (
              <div className="questions-list">
                {questions.map((question, index) => (
                  <div key={question._id} className="question-card">
                    <div className="question-header">
                      <h4>Question {index + 1}</h4>
                      <div className="question-meta">
                        <span className="marks">+{question.marks} marks</span>
                        <span className="negative">-{question.negativeMarks} marks</span>
                        <span className="difficulty">{question.difficulty}</span>
                      </div>
                    </div>
                    
                    <div className="question-content">
                      <div 
                        className="question-text"
                        dangerouslySetInnerHTML={{ __html: question.questionText }}
                      />
                      
                      <div className="options">
                        {['A', 'B', 'C', 'D'].map((option) => (
                          <div 
                            key={option} 
                            className={`option ${question.correctOption === option ? 'correct' : ''}`}
                          >
                            <strong>{option}:</strong> 
                            <span 
                              dangerouslySetInnerHTML={{ 
                                __html: question.options[option] 
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <div className="explanation">
                          <h5>Explanation:</h5>
                          <div 
                            dangerouslySetInnerHTML={{ __html: question.explanation }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedTestId ? (
              <p className="no-content">No questions available for the selected test.</p>
            ) : (
              <p className="no-content">Please select a test to view questions.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseContentManager;
