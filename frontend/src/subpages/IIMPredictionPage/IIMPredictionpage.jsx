import React, { useState } from "react";
import "./IIMPredictionpage.css";

import graphIIM from "../../images/graphIIM.png"



const data = {
  noSectionalCutOffs: [
    { name: "FMS Delhi", highest: "120 Lakh", avg: "34.1 Lakh", exam: "CAT" },
    { name: "DMS IIT Delhi", highest: "41.1 Lakh", avg: "25.8 Lakh", exam: "CAT" },
    { name: "SIBM Pune", highest: "35.05 Lakh", avg: "26.77 Lakh", exam: "SNAP" },
    { name: "VGSoM IIT Kharagpur", highest: "43.37 Lakh", avg: "22.13 Lakh", exam: "CAT" },
    { name: "MHRM IIT Kharagpur", highest: "13.21 Lakh", avg: "13.21 Lakh", exam: "CAT" },
    { name: "SCMHRD Pune", highest: "67 Lakh", avg: "23.71 Lakh", exam: "SNAP" },
    { name: "MICA Ahmedabad", highest: "36 Lakh", avg: "20.09 Lakh", exam: "CAT/XAT/MICAT" },
    { name: "IMT Ghaziabad", highest: "35 Lakh", avg: "17.34 Lakh", exam: "CAT/XAT/GMAT" },
    { name: "GLIM Chennai", highest: "46 Lakh", avg: "14.5 Lakh", exam: "CAT/XAT/GMAT/CMAT" },
    { name: "DoMS IIT Madras", highest: "30.06 Lakh", avg: "20.19 Lakh", exam: "CAT" },
  ],
  lessAcadsWeightage: [
    { name: "XLRI Jamshedpur", highest: "78.2 Lakh", avg: "32.7 Lakh", exam: "XAT" },
    { name: "FMS Delhi", highest: "120 Lakh", avg: "34.1 Lakh", exam: "CAT" },
    { name: "MDI Gurgaon", highest: "60 Lakh", avg: "27.67 Lakh", exam: "CAT" },
    { name: "IIFT Delhi", highest: "29.1 Lakh", avg: "75.6 Lakh", exam: "CUET PG" },
    { name: "SJMSOM, IIT-B", highest: "54 Lakh", avg: "28.8 Lakh", exam: "CAT" },
    { name: "SIBM Pune", highest: "35.05 Lakh", avg: "26.77 Lakh", exam: "SNAP" },
    { name: "NMIMS Mumbai", highest: "67.8 Lakh", avg: "26.63 Lakh", exam: "NMAT" },
    { name: "DMS, IIT-D", highest: "41.1 Lakh", avg: "25.8 Lakh", exam: "CAT" },
  ],
  bSchoolsViaXAT: [
    { name: "XLRI Jamshedpur", highest: "78.2 Lakh", avg: "32.7 Lakh", exam: "XAT" },
    { name: "XLRI Delhi", highest: "78.2 Lakh", avg: "32.7 Lakh", exam: "XAT" },
    { name: "XIM Bhubaneshwar", highest: "71.51 Lakh", avg: "20.03 Lakh", exam: "XAT" },
    { name: "MICA Ahmedabad", highest: "36 Lakh", avg: "20.09 Lakh", exam: "XAT" },
    { name: "IMT Ghaziabad", highest: "34 Lakh", avg: "17.35 Lakh", exam: "XAT" },
    { name: "IMI New Delhi", highest: "50 Lakh", avg: "17.01 Lakh", exam: "XAT" },
    { name: "GLIM Chennai", highest: "46 Lakh", avg: "19 Lakh", exam: "XAT" },
  ],
};


const contentData = {
    whatIsMBA: {
      title: "What is an MBA?",
      description: "MBA or Masters of Business Administration is a Postgraduate degree highly valued in the market. An MBA programme aims to impart a holistic knowledge in the field of Management under Finance, Marketing, Human Resources, Operations and several other domains.",
      points: ["Industry Knowledge", "Higher Earnings", "Personality Development", "Better Job Profile", "Networking", "Career Switch"]
    },
    whatIsCAT: {
      title: "Common Admission Test (CAT)",
      description: "Conducting Body: IIMs. Institutes Accepting CAT Score: 20 IIMs, FMS, MDI, SPJIMR & 1200+ other B-schools.",
      points: ["Top IIMs (Rotational Basis)", "B-Schools Packages: 36+ LPA for IIMs", "CAT is mandatory for most top B-Schools"]
    },
    examPattern: {
      title: "CAT Exam Pattern",
      description: "The CAT Exam is divided into 3 sections, spanning 40 minutes each, making it a 2-hour exam.",
      points: ["Quantitative Ability (22 Questions - 40 min)", "Verbal Ability & Reading Comprehension (24 Questions - 40 min)", "Logical Reasoning & Data Interpretation (20 Questions - 40 min)"]
    },
    eligibility: {
      title: "CAT Eligibility",
      description: "Required minimum graduation score to appear in CAT",
      points: ["General/OBC: 50%", "SC/ST/PwD: 45%", "Final year students can apply", "Professional courses (CA/CS/ICWA) are eligible"]
    },
    pastPapers: {
      title: "CAT Past Papers",
      description: "Past CAT Papers with detailed solutions in all required formats.",
      points: ["Topic-wise Past CAT Questions", "Year-wise Past CAT Questions", "Take Past CAT as a Mock"]
    }
  };



  const contentDataStyle = {
    quantSection: {
      title: "CAT Quant Syllabus & Weightage",
      image: "https://tse4.mm.bing.net/th?id=OIP.3rie0I0tdDl1V2qSJaUd3wHaEt&pid=Api&P=0&h=180",
      topics: [
        { topic: "Arithmetic", questions: "8 - 9" },
        { topic: "Algebra", questions: "5 - 6" },
        { topic: "Geometry", questions: "5 - 6" },
        { topic: "Numbers", questions: "1 - 3" },
        { topic: "Series, Logs, P and C", questions: "3 - 4" },
        { topic: "Miscellaneous", questions: "1 - 2" },
      ],
    },
    lrdiSection: {
      title: "LRDI Syllabus & Weightage",
      image:"https://tse4.mm.bing.net/th?id=OIP.KUtAAeZCe7ZwePt2n6k4EAHaEh&pid=Api&P=0&h=180",
      topics: {
        "Data Interpretation (DI)": ["Tables", "Line & Bar Graphs", "Pie Charts", "Quant Based DI"],
        "Logical Reasoning (LR)": [
          "Cubes",
          "Linear Arrangements",
          "Circular Arrangements",
          "Venn Diagrams",
          "Distribution",
          "Selection",
          "Binary Logics",
          "Games & Tournaments",
          "Network Flow Diagrams",
        ],
      },
    },
    varcSection: {
      title: "VARC Syllabus & Weightage",
      image:"https://tse1.mm.bing.net/th?id=OIP.jXDXYOJ6xRPmdyQgTKnxggHaEu&pid=Api&P=0&h=180",
      topics: {
        "Reading Comprehension Genre": [
          "Science & Tech.",
          "Business & Economics",
          "Arts, Society & Culture",
          "History & Politics",
          "Philosophy & Psychology",
          "Mixed",
        ],
        "Verbal Ability": [
          "Para Summary",
          "Para Completion",
          "Odd One Out",
          "Para Jumbles",
        ],
        "Weightage": [
          "RCs - 16 Questions (4 sets)",
          "Para Summary - 3 Questions",
          "Para Jumbles - 3 Questions",
          "Odd One Out - 2 Questions",
        ],
      },
    },
  };


 
  



  const scoreData = { // ✅ Changed Variable Name
    overall: {
      graph: graphIIM, // Graph image for Overall
      table: "https://media.iquanta.in/ui_images/score-vs-percentile-small.jpeg", // Table image for Overall
    },
    varc: {
      graph: graphIIM,
      table: "https://media.iquanta.in/ui_images/score-vs-percentile-small.jpeg",
    },
    lrdi: {
      graph: graphIIM,
      table: "https://media.iquanta.in/ui_images/score-vs-percentile-small.jpeg",
    },
    quant: {
      graph: graphIIM,
      table: "https://media.iquanta.in/ui_images/score-vs-percentile-small.jpeg",
    },
  };





const paidResources = [
  "Conceptual live Stream Classes 70+",
  "Live Application Classes 100+",
  "Conceptual lives Stream Classes 70+",
  "Mentor Driven Practice session (Weekly 4)",
  "iQuanta Exclusive Material (Per Topic 50 | Total 5000 Questions)",
  "iCAT Mocks: 20 Full | 45 Sectional",
  "IIM ABC Practice Batch 7500 Qs 500 RC SETS | 500 LRDI SETS | 2500 QA",
  "CAT Crash Course Rigorous Practice | Shortcuts | Live Marathons",
  "24×7 Doubt Solving",
  "Special Initiatives by Indrajeet Singh iQuanta 250 QA | LRDI 70 by Indra | RC 60 by Indra",
];

const freeResources = [
  { name: "CAT Past Year Papers", action: "CHECK NOW" },
  { name: "CAT Sectional Resources", action: "CHECK NOW" },
  { name: "CAT Doubt Solving Group", action: "JOIN NOW" },
  { name: "CAT LRDI Resources", action: "CHECK NOW" },
  { name: "Download Formula Book", action: "DOWNLOAD" },
  { name: "Download CAT Brochure", action: "DOWNLOAD" },
  { name: "Download MBA Brochure", action: "DOWNLOAD" },
  { name: "CAT Before CAT", action: "CHECK NOW" },
  { name: "iCAT Mocks", action: "ATTEMPT NOW" },
  { name: "120 QA Qs. Playlist", action: "CHECK NOW" },
  { name: "100 LRDI Qs. Playlist", action: "CHECK NOW" },
];





const IIMPredictionpage = () => {
  const [selectedCategory, setSelectedCategory] = useState("noSectionalCutOffs");
  const [visibleRows, setVisibleRows] = useState(5);
  const [selectedTab, setSelectedTab] = useState("whatIsMBA");
  const [activeTab, setActiveTab] = useState("quantSection");
  const [activeCategory, setActiveCategory] = useState("overall"); // ✅ Changed State Name
  // const [prevCategory, setPrevCategory] = useState("");

  const handleLoadMore = () => {
    setVisibleRows((prev) => prev + 5);
  };

  const handleLoadLess = () => {
    setVisibleRows(5);
  };

  
  // const handleCategoryChange = (category) => {
  //   if (category !== activeCategory) {
  //     setPrevCategory(activeCategory); // Store previous category
  //     setActiveCategory(category);
  //   }
  // };

  return (
    <div>
    <div className="container" style={{ marginTop: '100px' }}>
      <h2>IIMS & TOP B-SCHOOLS VIA CAT</h2>
      <div className="button-group">
        <button className="btn btn-success " style={{fontSize:"20px"}} onClick={() => setSelectedCategory("noSectionalCutOffs")}>No Sectional Cut Offs</button>
        <button  className="btn btn-info" style={{fontSize:"20px"}}  onClick={() => setSelectedCategory("lessAcadsWeightage")}>Less Acads Weightage</button>
        <button  className="btn btn-primary " style={{fontSize:"20px"}}  onClick={() => setSelectedCategory("bSchoolsViaXAT")}>B-Schools via XAT</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Highest Package</th>
            <th>Avg. Package</th>
            <th>Exams</th>
          </tr>
        </thead>
        <tbody>
          {data[selectedCategory].slice(0, visibleRows).map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.highest}</td>
              <td>{item.avg}</td>
              <td>{item.exam}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="load-buttons">
        {visibleRows < data[selectedCategory].length && (
          <button onClick={handleLoadMore}>Load More</button>
        )}
        {visibleRows > 5 && <button onClick={handleLoadLess}>Load Less</button>}
      </div>
    </div>

    <div className="cat-container-unique">
      <h1 className="title-unique">Everything about CAT 2025</h1>
      <div className="button-group-unique">
        <button className={selectedTab === "whatIsMBA" ? "active" : ""} onClick={() => setSelectedTab("whatIsMBA")}>What is MBA?</button>
        <button className={selectedTab === "whatIsCAT" ? "active" : ""} onClick={() => setSelectedTab("whatIsCAT")}>What is CAT?</button>
        <button className={selectedTab === "examPattern" ? "active" : ""} onClick={() => setSelectedTab("examPattern")}>CAT Exam Pattern</button>
        
        <button className={selectedTab === "eligibility" ? "active" : ""} onClick={() => setSelectedTab("eligibility")}>CAT Eligibility</button>
        <button className={selectedTab === "pastPapers" ? "active" : ""} onClick={() => setSelectedTab("pastPapers")}>CAT Past Papers</button>
      </div>
      <div className="content-box-unique">
        <h2>{contentData[selectedTab].title}</h2>
        <p>{contentData[selectedTab].description}</p>
        <ul>
          {contentData[selectedTab].points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    </div>  



    <div className="cat-prep-container">
      <h1 className="cat-prep-title">How to Begin Preparation</h1>

      <div className="cat-prep-buttons">
        <button
          className={activeTab === "quantSection" ? "active-tab" : ""}
          onClick={() => setActiveTab("quantSection")}
        >
          QUANT
        </button>
        <button
          className={activeTab === "lrdiSection" ? "active-tab" : ""}
          onClick={() => setActiveTab("lrdiSection")}
        >
          LRDI
        </button>
        <button
          className={activeTab === "varcSection" ? "active-tab" : ""}
          onClick={() => setActiveTab("varcSection")}
        >
          VARC
        </button>
      </div>

      <div className="cat-prep-content">
        <div className="cat-prep-image">
          <img src={contentDataStyle[activeTab].image} alt={activeTab} />
        </div>
        <div className="cat-prep-details">
          <h2>{contentDataStyle[activeTab].title}</h2>

          {activeTab === "quantSection" ? (
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {contentDataStyle.quantSection.topics.map((item, index) => (
                  <tr key={index}>
                    <td>{item.topic}</td>
                    <td>{item.questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            Object.entries(contentDataStyle[activeTab].topics).map(([key, value], index) => (
              <div key={index} className="cat-prep-topic-section">
                <h3>{key}</h3>
                <ul>
                  {value.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>




    <div className="cat-score-container">
  <h1 className="cat-score-heading">CAT Score vs Percentile in 2025</h1>
  <p className="cat-score-description">
    <strong>CAT Score:</strong> The total marks obtained by a candidate in the CAT exam.
  </p>
  <p className="cat-score-description">
    <strong>CAT Percentile:</strong> The relative position of a candidate as compared to all other test takers.
  </p>
  <p className="cat-score-text">
    The final CAT result consists of both CAT score and CAT percentile. For admissions, all MBA colleges consider CAT percentile. Your score is the determinant of percentile.
    Score Vs Percentile information is an important aspect considering the increasing competition in CAT.
  </p>

  <div className="cat-score-buttons">
    <button className={activeCategory === "overall" ? "active" : ""} onClick={() => setActiveCategory("overall")}>Overall</button>
    <button className={activeCategory === "varc" ? "active" : ""} onClick={() => setActiveCategory("varc")}>VARC</button>
    <button className={activeCategory === "lrdi" ? "active" : ""} onClick={() => setActiveCategory("lrdi")}>LRDI</button>
    <button className={activeCategory === "quant" ? "active" : ""} onClick={() => setActiveCategory("quant")}>Quant</button>
  </div>

  <div className="cat-score-content">
    <div className="cat-score-graph">
      <img src={scoreData[activeCategory]?.graph} alt="Graph" className="graph-transition" />
    </div>
    <div className="cat-score-table">
      <img src={scoreData[activeCategory]?.table} alt="Score Table" className="table-transition" />
    </div>
  </div>
</div>






<div className="cat-resources-container">
      <h1 className="cat-resources-heading">IQUANTA'S CAT RESOURCES</h1>

      {/* Paid & Free Sections */}
      <div className="cat-resources-section">
        {/* Paid Section */}
        <div className="resource-box paid-section">
          <h2 className="resource-title">PAID</h2>
          <ul className="resource-list">
            {paidResources.map((resource, index) => (
              <li key={index} className="resource-item">
                <span className="resource-number">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                <span>{resource}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Free Section */}
        <div className="resource-box free-section">
          <h2 className="resource-title" style={{ color: "green" }}>FREE</h2>
          <ul className="resource-list">
            {freeResources.map((resource, index) => (
              <li key={index} className="resource-item">
                <span className="resource-number">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                <span>{resource.name}</span>
                <button className="resource-button">{resource.action}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Enroll Now Section */}
      <div className="enroll-container">
        <p className="enroll-text">Everything Included in CAT Full Course just buy IIM ABC as an addon.</p>
        <button className="enroll-button">ENROL NOW</button>
      </div>
    </div>





    </div>
  );
};

export default  IIMPredictionpage;
