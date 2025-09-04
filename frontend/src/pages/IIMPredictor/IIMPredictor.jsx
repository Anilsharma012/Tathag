import React, { useState, useEffect } from "react";
import "./IIMPredictor.css"; // Importing CSS for styling
import axios from "axios"; // ✅ Import Axios
import { useNavigate } from "react-router-dom";
import IIMPredictionpage from "../../subpages/IIMPredictionPage/IIMPredictionpage";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";

const IIMPredictor = () => {
  const [link, setLink] = useState("");
  // const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [userDetails, setUserDetails] = useState(null);
  // const [htmlContent, setHtmlContent] = useState(null); // ✅ Store HTML for response sheet
  const navigate = useNavigate();
  const [fullHtml, setFullHtml] = useState(""); // ✅ Store full HTML content
  const [questions, setQuestions] = useState([]); // ✅ Store Questions
  const [score, setScore] = useState(null); // ✅ Store Score Data

  const user = JSON.parse(localStorage.getItem("user")); // ✅ Extract User Data
  const userId = user?.id; // ✅ Get userId safely

  const [formData, setFormData] = useState({
    category: "",
    gender: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    discipline: "",
    degree: "",
    graduationPercentage: "",
    workExperience: "",
    takenCAT: "",
    catYear: "",
    interestedCourses: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        interestedCourses: Array.isArray(prev.interestedCourses)
          ? checked
            ? [...prev.interestedCourses, value]
            : prev.interestedCourses.filter((course) => course !== value)
          : [value], // ✅ Ensure it remains an array
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("⚠️ Please login to submit your details!");
      localStorage.setItem("redirectAfterLogin", "/iim-results");
      localStorage.setItem("formData", JSON.stringify(formData));
      navigate("/login");
      return;
    }

    const requestData = {
      userId: user.id,
      category: formData.category,
      gender: formData.gender,
      classX: formData.tenthPercentage,
      classXII: formData.twelfthPercentage,
      discipline: formData.discipline,
      graduation: formData.degree,
      gradPercentage: formData.graduationPercentage,
      workExperience: formData.workExperience,
      takenCATBefore: formData.takenCAT,
      catYear: formData.catYear,
      interestedCourses: formData.interestedCourses,
    };

    try {
      setLoading(true);
      console.log("🔍 Submitting Data:", requestData); // ✅ Debugging

      const response = await axios.post(
        "/api/v2/iim-predictor",
        requestData
      );

      console.log("✅ API Response:", response.data); // ✅ Debugging

      setLoading(false);

      if (response.status === 200 || response.status === 201) {
        alert("✅ Form Submitted Successfully!");
        localStorage.setItem(
          `iim-predictor-${user.id}`,
          JSON.stringify(response.data)
        );

        console.log("Navigating to:", `/iim-results/${user.id}`);
        navigate(`/iim-results/${user.id}`);
      }
    } catch (error) {
      setLoading(false);
      console.error(
        "❌ Error submitting form:",
        error.response?.data || error.message
      );
      alert("❌ Submission failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!userId) return;

    const storedData = localStorage.getItem(`iim-predictor-${userId}`);
    if (storedData) {
      setFormData(JSON.parse(storedData)); // ✅ Restore saved form data
    }
  }, [userId]);

  // const handleFileChange = (e) => {
  //   setFile(e.target.files[0]);
  // };

  const handleSearch = async () => {
    if (!link) {
        toast.error("⚠️ Please provide a valid link.");
        return;
    }

    setLoading(true);
    try {
        const response = await axios.post("/api/v3/fetch-questions", { link });

        if (response.data.fullHtmlContent) {
            setFullHtml(response.data.fullHtmlContent);
        }

        if (response.data.questions && response.data.questions.length > 0) {
            setQuestions([...response.data.questions]); // ✅ Store Questions
            console.log("✅ Fetched Questions:", response.data.questions); // ✅ Debugging
        } else {
            console.warn("⚠️ No questions found in API response.");
            toast.error("⚠️ No questions found.");
        }

        toast.success("✅ Response sheet fetched successfully!");
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        toast.error("❌ Failed to fetch response sheet.");
    }
    setLoading(false);
};


  
const calculateScore = () => {
  console.log("📌 Current Questions Before Scoring:", questions); 

  if (!questions || questions.length === 0) {
      toast.error("⚠️ No questions available to calculate score.");
      return;
  }

  let correct = 0, wrong = 0, unattempted = 0;

  questions.forEach(q => {
      console.log("🔍 Checking Question:", q);
      console.log("✅ Chosen Option:", q.chosenOption, " | 🎯 Correct Answer:", q.correctAnswer);

      if (q.chosenOption && q.correctAnswer) {
          if (q.chosenOption.trim() === q.correctAnswer.trim()) { // ✅ Trim extra spaces
              correct++;
          } else if (q.chosenOption === "N/A" || q.chosenOption === "") {
              unattempted++;
          } else {
              wrong++;
          }
      }
  });

  const totalScore = correct * 3 - wrong * 1;
  setScore({ correct, wrong, unattempted, total: totalScore });

  console.log("✅ Score Calculation:", { correct, wrong, unattempted, total: totalScore });
  toast.success("✅ Score calculated successfully!");
};

const downloadScorecard = () => {
    const doc = new jsPDF();

    // ✅ Set Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Student Response Sheet Scorecard", 20, 20);

    // ✅ Set Normal Font
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`✅ Correct Answers: ${score.correct}`, 20, 40);
    doc.text(`❌ Wrong Answers: ${score.wrong}`, 20, 50);
    doc.text(`➖ Unattempted: ${score.unattempted}`, 20, 60);
    doc.text(`🎯 Total Score: ${score.total}`, 20, 70);

    // ✅ Save PDF
    doc.save("Response_Sheet_Scorecard.pdf");
    toast.success("✅ Scorecard downloaded successfully!");
  };

  const handlePrint = () => {
    const printContent = document.querySelector(".response-sheet");
    
    if (!printContent) {
        toast.error("⚠️ No response sheet available to print.");
        return;
    }

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Response Sheet</title></head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
};

  return (
    <div>
      <div className="predictor-container">
        <h2 className="predictor-heading">
          📜 CMAT/CAT Response Sheet Checker
        </h2>

        {/* ✅ Input for Response Sheet Link */}
        <input
        className="MainInput"
          type="text"
          placeholder="Paste response sheet link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

       

        {/* ✅ Search Button */}
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Fetching..." : "Check Response Sheet"}
        </button>

        {/* ✅ Print Button to Download the Response Sheet */}
         <button onClick={handlePrint} className="print-btn">Print</button>


        {/* ✅ Display Full Response Sheet (With Images & Tables) */}
        {fullHtml && (
          <div
            className="response-sheet"
            dangerouslySetInnerHTML={{ __html: fullHtml }}
          />
        )}

        {/* ✅ Calculate Score Button */}
        <button onClick={calculateScore}>Calculate Score</button>

        {/* ✅ Show Scorecard Section */}
        {score && (
    <div className="scorecard-section">
        <h3>📜 Scorecard</h3>
        <p>✅ Correct Answers: <strong>{score.correct}</strong></p>
        <p>❌ Wrong Answers: <strong>{score.wrong}</strong></p>
        <p>➖ Unattempted: <strong>{score.unattempted}</strong></p>
        <p>🎯 Total Score: <strong>{score.total}</strong></p>

        {/* ✅ Download Scorecard Button */}
        <button onClick={downloadScorecard}>Download Scorecard</button>
    </div>
)}
        <ToastContainer />
      </div>




      <div className="IIM-container">
      <h1>Lets Take Test </h1>
      <p>Test your percentile with our online mock exam.</p>
      <button className="ExamButton" onClick={() => navigate("/exam")}>Start Exam</button>
    </div>






      <div className="predictor-container">
        <h2 className="predictor-heading">LET'S PREDICT YOUR MBA COLLEGE</h2>
        <form className="predictor-form" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-group">
            <label>PERSONAL INFORMATION</label>
            <select
              name="category"
              onChange={handleChange}
              value={formData.category}
            >
              <option value="">Category (e.g. OBC)</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC/ST">SC/ST</option>
            </select>
            <select
              name="gender"
              onChange={handleChange}
              value={formData.gender}
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label></label>
            <select
              name="discipline"
              onChange={handleChange}
              value={formData.discipline}
            >
              <option value="">Discipline (e.g. Science)</option>
              <option value="BBA">Science</option>
              <option value="BCom">Commerce</option>
              <option value="Engineering">Arts</option>
            </select>

            <input
              type="text"
              name="tenthPercentage"
              placeholder=" 10th Percentage (e.g. 98.72)"
              onChange={handleChange}
              value={formData.tenthPercentage}
            />
            <input
              type="text"
              name="twelfthPercentage"
              placeholder=" 12th Percentage (e.g. 98.72)"
              onChange={handleChange}
              value={formData.twelfthPercentage}
            />
          </div>

          {/* Graduation Details */}
          <div className="form-group">
            <label>GRADUATION</label>
            <select
              name="degree"
              onChange={handleChange}
              value={formData.degree}
            >
              <option value="">Degree (e.g. BBA)</option>
              <option value="BBA">BBA</option>
              <option value="BCom">B.Com</option>
              <option value="Engineering">Engineering</option>
            </select>
            <input
              type="text"
              name="graduationPercentage"
              placeholder="Graduation Percentage (e.g. 98.72)"
              onChange={handleChange}
              value={formData.graduationPercentage}
            />
            <input
              type="text"
              name="workExperience"
              placeholder="Enter in Months (0 if no work ex)"
              onChange={handleChange}
              value={formData.workExperience}
            />
          </div>

          {/* CAT Exam Details */}
          <div className="form-group">
            <label>HAVE YOU TAKEN CAT BEFORE?</label>
            <select
              name="takenCAT"
              onChange={handleChange}
              value={formData.takenCAT}
            >
              <option value="">Select (i.e. Yes)</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <select
              name="catYear"
              onChange={handleChange}
              value={formData.catYear}
            >
              <option value="">Select Year (i.e. 2024)</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Course Interest Section */}
          <div className="form-group radio-group">
            <label>INTERESTED IN IQUANTA CAT/MBA COURSE?</label>
            <label>
              <input
                type="radio"
                name="interested"
                value="Yes"
                onChange={handleChange}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="interested"
                value="No"
                onChange={handleChange}
              />{" "}
              No
            </label>
          </div>

          {/* Course Selection */}
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="course"
                value="CAT Full Course"
                onChange={handleChange}
              />{" "}
              CAT Full Course
            </label>
            <label>
              <input
                type="checkbox"
                name="course"
                value="NMAT+SNAP Course"
                onChange={handleChange}
              />{" "}
              NMAT+SNAP Course
            </label>
            <label>
              <input
                type="checkbox"
                name="course"
                value="XAT Course"
                onChange={handleChange}
              />{" "}
              XAT Course
            </label>
            <label>
              <input
                type="checkbox"
                name="course"
                value="CMAT Course"
                onChange={handleChange}
              />{" "}
              CMAT Course
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Submitting...
              </>
            ) : (
              "SUBMIT"
            )}
          </button>
        </form>
      </div>

      <div>
        <IIMPredictionpage />
      </div>
    </div>
  );
};

export default IIMPredictor;
