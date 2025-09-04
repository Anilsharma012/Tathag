import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import "./AddQuestion.css";

const AddQuestion = () => {
  const editor = useRef(null);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tests, setTests] = useState([]);

  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [test, setTest] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
  const [correctOption, setCorrectOption] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [marks, setMarks] = useState(2);
  const [negativeMarks, setNegativeMarks] = useState(0.66);
  const [isActive, setIsActive] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("adminToken");

  // Helper function to extract text from HTML content
  const getTextFromHTML = (htmlContent) => {
    if (!htmlContent) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const joditConfig = {
    readonly: false,
    toolbarSticky: false,
    uploader: {
      insertImageAsBase64URI: false,
      url: "/api/upload",
      filesVariableName: function () {
        return "file";
      },
      prepareData: function (formData) {
        return formData;
      },
      isSuccess: function (resp) {
        return resp.success === true;
      },
      getMessage: function (resp) {
        return resp.message || "Upload failed";
      },
      process: function (resp) {
        return {
          files: [resp.url]
        };
      }
    },
    buttons: [
      "bold",
      "italic",
      "underline",
      "ul",
      "ol",
      "outdent",
      "indent",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "image",
      "video",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "hr",
      "eraser",
      "fullsize"
    ],
  };

  // Fetch courses
  useEffect(() => {
    axios.get("/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setCourses(res.data.courses || []));
  }, []);

  // Fetch subjects
  useEffect(() => {
    if (!course) return;
    axios.get(`/api/subjects/${course}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setSubjects(res.data.subjects || []));
  }, [course]);

  // Fetch chapters
  useEffect(() => {
    if (!subject) return;
    axios.get(`/api/chapters/${subject}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setChapters(res.data.chapters || []));
  }, [subject]);

  // Fetch topics
  useEffect(() => {
    if (!chapter) return;
    axios.get(`/api/topics/${chapter}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setTopics(res.data.topics || []));
  }, [chapter]);

  // Fetch tests
  useEffect(() => {
    if (!topic) return;
    axios.get(`/api/tests/${topic}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setTests(res.data.tests || []));
  }, [topic]);

  // Fetch questions for selected test
  useEffect(() => {
    if (!test) return;
    const token = localStorage.getItem("adminToken");

    axios
      .get(`/api/questions?testId=${test}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setQuestions(res.data.questions || []))
      .catch((err) => console.error("❌ Fetch question error:", err));
  }, [test]);

  const handleOptionChange = (optionKey, value) => {
    console.log(`📝 Option ${optionKey} changed:`, value);
    setOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  const handleQuestionTextChange = (value) => {
    console.log("📝 Question text changed:", value);
    setQuestionText(value);
  };

  const validateForm = () => {
    console.log("🔍 Validating form...");
    console.log("Test:", test);
    console.log("Question Text (raw):", questionText);
    console.log("Question Text (type):", typeof questionText);
    console.log("Question Text (length):", questionText?.length);
    console.log("Options (raw):", options);
    console.log("Correct Option:", correctOption);

    // Check test selection
    if (!test) {
      console.log("❌ Test not selected");
      toast.error("Please select a test");
      return false;
    }

    // More flexible question text validation
    let hasQuestionText = false;
    if (questionText) {
      // Try multiple ways to check if content exists
      const plainText = getTextFromHTML(questionText);
      const directTrim = questionText.trim();
      const hasContent = plainText.trim().length > 0 || directTrim.length > 3; // Allow some HTML tags

      console.log("Plain text extracted:", plainText);
      console.log("Direct trim:", directTrim);
      console.log("Has content:", hasContent);

      hasQuestionText = hasContent;
    }

    if (!hasQuestionText) {
      console.log("❌ Question text is empty or invalid");
      toast.error("Please enter question text");
      return false;
    }

    // Check options with flexible validation
    const checkOption = (optionKey, optionValue) => {
      if (!optionValue) return false;

      const plainText = getTextFromHTML(optionValue);
      const directTrim = optionValue.trim();
      const hasContent = plainText.trim().length > 0 || directTrim.length > 3;

      console.log(`Option ${optionKey} - Plain:`, plainText, "Direct:", directTrim, "Has content:", hasContent);
      return hasContent;
    };

    if (!checkOption('A', options.A)) {
      console.log("❌ Option A is empty");
      toast.error("Please fill Option A");
      return false;
    }

    if (!checkOption('B', options.B)) {
      console.log("❌ Option B is empty");
      toast.error("Please fill Option B");
      return false;
    }

    if (!checkOption('C', options.C)) {
      console.log("❌ Option C is empty");
      toast.error("Please fill Option C");
      return false;
    }

    if (!checkOption('D', options.D)) {
      console.log("❌ Option D is empty");
      toast.error("Please fill Option D");
      return false;
    }

    if (!correctOption) {
      console.log("❌ Correct option not selected");
      toast.error("Please select the correct option");
      return false;
    }

    if (!["A", "B", "C", "D"].includes(correctOption)) {
      console.log("❌ Invalid correct option:", correctOption);
      toast.error("Please select a valid correct option (A, B, C, or D)");
      return false;
    }

    console.log("✅ Validation passed");
    return true;
  };

  const resetForm = () => {
    setCourse("");
    setSubject("");
    setChapter("");
    setTopic("");
    setTest("");
    setQuestionText("");
    setOptions({ A: "", B: "", C: "", D: "" });
    setCorrectOption("");
    setExplanation("");
    setDifficulty("Medium");
    setMarks(2);
    setNegativeMarks(0.66);
    setIsActive(true);
    setEditingQuestionId(null);
  };

  const handleSubmit = async () => {
    console.log("🚀 Save button clicked!");

    // Prevent double submission
    if (isSubmitting) {
      console.log("⏳ Already submitting, returning...");
      return;
    }

    // Validate form - if invalid, don't call API
    if (!validateForm()) {
      console.log("❌ Validation failed");
      return;
    }

    console.log("✅ Validation passed, submitting...");
    setIsSubmitting(true);

    // Prepare exact POST body as specified
    const questionData = {
      testId: test,
      questionText: questionText, // Keep HTML for rich content
      options: {
        A: options.A, // Keep HTML for rich content
        B: options.B,
        C: options.C,
        D: options.D
      },
      correctOption,
      explanation: explanation, // Keep HTML for rich content
      difficulty,
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
      isActive
    };

    console.log("📝 Question data to send:", questionData);

    try {
      const token = localStorage.getItem("adminToken");
      console.log("🔑 Token exists:", !!token);

      // Make exactly one POST request
      console.log("📡 Making POST request to /api/questions");
      const response = await axios.post(`/api/questions`, questionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Response received:", response.status, response.data);

      // Success (201 or ok:true) → green toast "Saved"
      if (response.status === 201 || response.data?.success === true) {
        console.log("🎉 Success! Showing toast and refetching...");
        toast.success("Saved");

        // Then one refetch: GET /api/questions?testId=<TEST_ID>
        const refetchRes = await axios.get(`/api/questions?testId=${test}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(refetchRes.data.questions || []);

        // Reset form after successful save
        resetForm();
      }

    } catch (err) {
      console.error("Submit error:", err);

      // Extract error message in specified order
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          err.response?.data?.errors?.[0]?.msg ||
                          "Save failed";

      // Red toast with server message, re-enable button
      toast.error(errorMessage);
      setIsSubmitting(false); // Re-enable button on error
      return; // No retry
    }

    // Only disable button during success flow
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success("Question deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete question");
    }
  };

  const handleEdit = (q) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.questionText);
    setOptions(q.options || { A: "", B: "", C: "", D: "" });
    setCorrectOption(q.correctOption);
    setExplanation(q.explanation || "");
    setDifficulty(q.difficulty || "Medium");
    setMarks(q.marks || 2);
    setNegativeMarks(q.negativeMarks || 0.66);
    setIsActive(q.isActive !== undefined ? q.isActive : true);
  };

  return (
    <div className="add-question-container">
      <h2>➕ Add New Question</h2>

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
        <div className="form-group">
          <label>Test</label>
          <select value={test} onChange={(e) => setTest(e.target.value)}>
            <option value="">-- Select Test --</option>
            {tests.map((t) => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}

      {test && (
        <>
          <div className="form-group">
            <label>Question Text</label>
            <JoditEditor
              ref={editor}
              config={joditConfig}
              value={questionText}
              onChange={handleQuestionTextChange}
            />
            <small style={{color: "#666", fontSize: "12px"}}>
              Debug: Current length = {questionText?.length || 0}
            </small>
          </div>

          <div className="form-group">
            <label>Options</label>
            {["A", "B", "C", "D"].map((optionKey) => (
              <div key={optionKey} style={{ marginBottom: "15px" }}>
                <label>Option {optionKey}</label>
                <JoditEditor
                  value={options[optionKey]}
                  config={joditConfig}
                  onChange={(val) => handleOptionChange(optionKey, val)}
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Correct Option</label>
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
            >
              <option value="">-- Select Correct Option --</option>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <div className="form-group">
            <label>Explanation (optional)</label>
            <JoditEditor
              ref={editor}
              config={joditConfig}
              value={explanation}
              onChange={setExplanation}
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label>Marks</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label>Negative Marks</label>
            <input
              type="number"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>

          <div style={{display: "flex", gap: "10px", marginBottom: "10px"}}>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{flex: 1}}
            >
              {isSubmitting
                ? "⏳ Saving..."
                : editingQuestionId
                  ? "✏️ Update Question"
                  : "🚀 Save Question"
              }
            </button>

            <button
              type="button"
              onClick={() => {
                console.log("🔍 DEBUG STATE:");
                console.log("Test:", test);
                console.log("Question Text:", questionText);
                console.log("Options:", options);
                console.log("Correct Option:", correctOption);
                alert(`DEBUG:\nTest: ${test}\nQuestion: ${questionText?.substring(0, 50)}...\nOptions: ${JSON.stringify(options, null, 2)}\nCorrect: ${correctOption}`);
              }}
              style={{
                background: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              🔍 Debug
            </button>
          </div>
        </>
      )}

      {questions.length > 0 && (
        <div className="table-wrapper">
          <h3>📝 Questions List</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Correct Option</th>
                <th>Difficulty</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => (
                <tr key={q._id}>
                  <td>{i + 1}</td>
                  <td>{q.questionText?.slice(0, 60)}...</td>
                  <td>{q.correctOption}</td>
                  <td>{q.difficulty}</td>
                  <td>{q.marks}</td>
                  <td>
                    <button onClick={() => handleEdit(q)}>✏️</button>
                    <button onClick={() => handleDelete(q._id)}>🗑️</button>
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

export default AddQuestion;
