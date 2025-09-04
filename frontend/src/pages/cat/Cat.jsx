  import React, { useState } from "react";
  import "./Cat.css";
  import { Bar } from "react-chartjs-2";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
  } from "chart.js";
import Mycourse from "../../components/MyCourses/Mycourse"
  import student4 from "../../images/image 38.png";

  import contactTeam from "../../images/contactTeams.png";
  import { FaArrowLeft, FaArrowRight, FaCalendarAlt } from "react-icons/fa";

  import { LazyLoadImage } from "react-lazy-load-image-component";
  import "react-lazy-load-image-component/src/effects/blur.css";

  import team from "../../images/contactTeams.png";
  import graph from "../../images/graphTathgat.jpeg";
  import graph2 from "../../images/graphTathagat2.jpeg";
  import score from "../../images/ScoreCardThree.png";
  import score1 from "../../images/scorenine.jpg";
  import score2 from "../../images/scoreeight.jpg";


  import f1 from "../../images/scoreCard/one.png";
  import f2 from "../../images/scoreCard/two.png";
  import f3 from "../../images/scorefifty.jpg";
  import f4 from "../../images/scoreelewen.jpg";
  import f5 from "../../images/scoreeight.jpg";
  import f6 from "../../images/scoreseven.jpg";
  import f7 from "../../images/scorenine.jpg";
  import f8 from "../../images/scorethirty.jpg";
  import f9 from "../../images/scoreten.jpg";
  import f10 from "../../images/scorefourty.jpg";
  // ...






  import footerOne from "../../images/footer1.png";
  import footerTwo from "../../images/footer2.png";
  import footerThree from "../../images/footer3.png";
  import footerFour from "../../images/footer4.png";

  import image1 from "../../images/Toppers/MUDIT RASTOGI.jpg";
  import image3 from "../../images/Toppers/LUV.jpg";
  import image5 from "../../images/Toppers/hARSHIT.jpg";
  import image6 from "../../images/Toppers/ADITYA.jpg";

  import { useNavigate } from "react-router-dom";





  const scoreImages = [score, score1, score2];  // 3 alag images

  /* ===================== Syllabus data + helpers (outside component) ===================== */
  const quantRows = [
    { header: "Arithmetic" },
    { topic: "Averages, Ratio & Proportion", y2022: 5, y2023: 3, y2024: 4 },
    { topic: "Profit and Loss, Interest", y2022: 3, y2023: 2, y2024: 2 },
    { topic: "Time, Distance and Work", y2022: 1, y2023: 2, y2024: 2 },

    { header: "Algebra" },
    { topic: "Quadratic & Polynomial Equations", y2022: 1, y2023: 2, y2024: 2 },
    { topic: "Linear Equations & Inequalities", y2022: 2, y2023: 3, y2024: 3 },
    { topic: "Logarithms, Surds & Indices", y2022: 1, y2023: 0, y2024: 2 },

    { topic: "Geometry & Mensuration", y2022: 3, y2023: 2, y2024: 3 },
    { topic: "Number Systems", y2022: 3, y2023: 2, y2024: 2 },
    { topic: "Progressions and Series", y2022: 1, y2023: 1, y2024: 1 },
    { topic: "Functions and Graphs", y2022: 1, y2023: 0, y2024: 2 },
    { topic: "Probability & Combinatorics", y2022: 1, y2023: 1, y2024: 0 },
    { topic: "Functions and Graphs", y2022: 1, y2023: 0, y2024: 0 },
  ];

  const feedbackImages = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10];

  function filterRows(rows, mode) {
    if (mode === "FULL") return rows;
    if (mode === "SEVENTY")
      return rows.filter(
        (r) => r.header || (typeof r.y2024 === "number" && r.y2024 >= 2)
      );
    if (mode === "ZERO") return rows.filter((r) => r.header || r.y2024 === 0);
    return rows;
  }
  /* ====================================================================================== */

  const Cat = () => {
    ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

    const data = {
      labels: ["0–60", "60–70", "70–80", "80–90", "90–100"],
      datasets: [
        {
          label: "99+ %ilers",
          data: [20, 40, 60, 80, 100],
          backgroundColor: "#ffc107",
          borderRadius: 8,
        },
      ],
    };

    const navigate = useNavigate();

    const blogData = [
      {
        id: 1,
        image: footerOne,
        date: "Feb 24, 2025",
        title: " CAT Preparation , CUET Preparation , XAT Preparation",
      },
      {
        id: 2,
        image: footerTwo,
        date: "Feb 24, 2025",
        title: "CAT Preparation , CUET Preparation , Exam Updates ",
      },
      {
        id: 3,
        image: footerThree,
        date: "Feb 24, 2025",
        title: " CAT Preparation , cat exam 2024 , cat preparation tips",
      },
      {
        id: 4,
        image: footerFour,
        date: "Feb 24, 2025",
        title: "Important points to remember while writing your CAT exam",
      },
    ];

    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: "#fff" },
          title: { display: true, text: "Scores", color: "#fff" },
          grid: { display: false },
        },
        y: {
          ticks: { color: "#fff" },
          title: { display: true, text: "No. of Scorers", color: "#fff" },
          grid: { color: "#444" },
        },
      },
    };

    const programs = [
      {
        title: "CAT 2025 Full Course",
        image: student4,
        features: [
          "800+ hours of live classes covering QA, VARC, LR-DI, Vocabulary, and GK",
          "AI-driven test analytics with 1000+ mock tests & sectional tests",
          "Personalized mentorship with 24x7 doubt-solving and small batch sizes",
          "GD-PI & WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
        oldPrice: "₹1,20,000/-",
        buttonLabel: "Enroll Now",
        buttonLabel2: "Book Free Demo ",
      },
      {
        title: "CAT 2025 Full Course",
        image: student4,
        features: [
          "800+ hours of live classes covering QA, VARC, LR-DI, Vocabulary, and GK",
          "AI-driven test analytics with 1000+ mock tests & sectional tests",
          "Personalized mentorship with 24x7 doubt-solving and small batch sizes",
          "GD-PI & WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
        oldPrice: "₹1,20,000/-",
        buttonLabel: "Enroll Now",
        buttonLabel2: "Book Free Demo ",
      },
      {
        title: "CAT 2025 Full Course",
        image: student4,
        features: [
          "800+ hours of live classes covering QA, VARC, LR-DI, Vocabulary, and GK",
          "AI-driven test analytics with 1000+ mock tests & sectional tests",
          "Personalized mentorship with 24x7 doubt-solving and small batch sizes",
          "GD-PI & WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
        oldPrice: "₹1,20,000/-",
        buttonLabel: "Enroll Now",
        buttonLabel2: "Book Free Demo ",
      },
      {
        title: "CAT 2025 Full Course",
        image: student4,
        features: [
          "800+ hours of live classes covering QA, VARC, LR-DI, Vocabulary, and GK",
          "AI-driven test analytics with 1000+ mock tests & sectional tests",
          "Personalized mentorship with 24x7 doubt-solving and small batch sizes",
          "GD-PI & WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
        oldPrice: "₹1,20,000/-",
        buttonLabel: "Enroll Now",
        buttonLabel2: "Book Free Demo ",
      },
    ];

    const courseData = [
      {
        title: "CAT 2025 Full Course",
        description: [
          "800+ hours of live classes covering QA, VARC, LR-DI, vocabulary, and GK",
          "All-India test analytics with 1000+ mock tests & sectional tests",
          "1-on-1 mentorship with 24x7 doubt solving and personal mentors",
          "GD-PI-WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
      },
      {
        title: "CAT 2025 Full Course",
        description: [
          "800+ hours of live classes covering QA, VARC, LR-DI, vocabulary, and GK",
          "All-India test analytics with 1000+ mock tests & sectional tests",
          "1-on-1 mentorship with 24x7 doubt solving and personal mentors",
          "GD-PI-WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
      },
      {
        title: "CAT 2025 Full Course",
        description: [
          "800+ hours of live classes covering QA, VARC, LR-DI, vocabulary, and GK",
          "All-India test analytics with 1000+ mock tests & sectional tests",
          "1-on-1 mentorship with 24x7 doubt solving and personal mentors",
          "GD-PI-WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
      },
      {
        title: "CAT 2025 Full Course",
        description: [
          "800+ hours of live classes covering QA, VARC, LR-DI, vocabulary, and GK",
          "All-India test analytics with 1000+ mock tests & sectional tests",
          "1-on-1 mentorship with 24x7 doubt solving and personal mentors",
          "GD-PI-WAT training for final B-school selection",
          "Flexible learning options – weekday & weekend batches available",
        ],
        price: "₹30,000/-",
      },
    ];

    const scorers = [
      {
        name: "Abhishek Kumar",
        photo: "https://i.pravatar.cc/150?img=1",
        percentile: "99.9%",
        section1: "QA: 99.85",
        section2: "DILR: 97.1",
        section3: "VARC: 98.2",
        video: "https://youtu.be/9JIcatfLQ5k?si=UHacR3i8BKrAo2rk",
      },
      {
        name: "Abishek Kumar",
        photo: "https://i.pravatar.cc/150?img=2",
        percentile: "99.9%",
        section1: "QA: 95.5",
        section2: "DILR: 97.1",
        section3: "VARC: 96.3",
        video: "https://youtu.be/uENlBxSGf-Q?si=rhQ4g1oO6qu3Tppa",
      },
      {
        name: "Abhishek Kumar",
        photo: "https://i.pravatar.cc/150?img=3",
        percentile: "99.9%",
        section1: "QA: 98.5",
        section2: "DILR: 97.1",
        section3: "VARC: 94.2",
        video: "https://youtu.be/OcJId_ai8uY?si=_Jx-IAObqcgQ72MQ",
      },
      {
        name: "Divyam Gaba",
        photo: "https://i.pravatar.cc/150?img=4",
        percentile: "99.5%",
        section1: "QA: 96.3",
        section2: "DILR: 95.0",
        section3: "VARC: 97.8",
        video: "https://youtu.be/KybGz3L5R3A?si=EmHdNyzi_fmd5J29",
      },
    ];

    const data1 = [
      { year: "2021", a: "99.5", b: "99.7", c: "99.6", d: "97.5", e: "95.5", f: "96.0" },
      { year: "2022", a: "99.4", b: "99.6", c: "99.5", d: "97.2", e: "95.0", f: "95.8" },
      { year: "2023", a: "99.2", b: "99.5", c: "99.4", d: "96.0", e: "94.8", f: "95.5" },
      { year: "2024", a: "99.0", b: "99.4", c: "99.3", d: "96.5", e: "94.5", f: "95.2" },
    ];

    // const feedbackImages = [
    //   "/feedbacks/f1.png",
    //   "/feedbacks/f2.png",
    //   "/feedbacks/f3.png",
    //   "/feedbacks/f4.png",
    //   "/feedbacks/f5.png",
    //   "/feedbacks/f6.png",
    //   "/feedbacks/f7.png",
    //   "/feedbacks/f8.png",
    //   "/feedbacks/f9.png",
    //   "/feedbacks/f10.png",
    // ];


    const [showAll, setShowAll] = useState(false);
    const visibleCourses = showAll ? programs : programs.slice(0, 2);

    const videosData = {
      all: [
        {
          id: 1,
          title: "How to Prepare for CAT | Sumit | TathaGat",
          author: "Sumit (TathaGat)",
          url: "https://www.youtube.com/embed/9JIcatfLQ5k",
          description:
            "Sumit shares key strategies and study tips to crack CAT with TathaGat guidance.",
        },
        {
          id: 2,
          title: "How to crack IIM Ahmedabad | Ayush Kovind | TathaGat",
          author: "Ayush Kovind (TathaGat)",
          url: "https://www.youtube.com/embed/uENlBxSGf-Q",
          description:
            "Ayush Kovind reveals his approach to cracking IIM Ahmedabad with focused preparation.",
        },
        {
          id: 3,
          title: "How to crack ISB | Anshul Malik | TathaGat",
          author: "Anshul Malik (TathaGat)",
          url: "https://www.youtube.com/embed/OcJId_ai8uY",
          description:
            "Anshul Malik gives insights into clearing ISB with effective preparation strategies.",
        },
        {
          id: 4,
          title: "How to crack S. P. Jain | Aditya Dang | TathaGat",
          author: "Aditya Dang (TathaGat)",
          url: "https://www.youtube.com/embed/KybGz3L5R3A",
          description:
            "Aditya Dang shares his experience and tips on successfully cracking S. P. Jain.",
        },
      ],
      quant: [
        {
          id: 1,
          title: "How to Prepare for CAT | Sumit | TathaGat",
          author: "Sumit (TathaGat)",
          url: "https://www.youtube.com/embed/9JIcatfLQ5k",
          description:
            "Sumit shares key strategies and study tips to crack CAT with TathaGat guidance.",
        },
      ],
      varc: [
        {
          id: 3,
          title: "How to crack ISB | Anshul Malik | TathaGat",
          author: "Anshul Malik (TathaGat)",
          url: "https://www.youtube.com/embed/OcJId_ai8uY",
          description:
            "Anshul Malik gives insights into clearing ISB with effective preparation strategies.",
        },
      ],
      lrdi: [
        {
          id: 4,
          title: "How to crack S. P. Jain | Aditya Dang | TathaGat",
          author: "Aditya Dang (TathaGat)",
          url: "https://www.youtube.com/embed/KybGz3L5R3A",
          description:
            "Aditya Dang shares his experience and tips on successfully cracking S. P. Jain.",
        },
      ],
    };

    const [category, setCategory] = useState("all");

    /* ===================== Syllabus state (inside component) ===================== */
    const [syllabusTab, setSyllabusTab] = useState("FULL"); // FULL | SEVENTY | ZERO
    const shownRows = filterRows(quantRows, syllabusTab);
    /* ============================================================================ */

    return (
      <div>
        <>
          <section className="ttp-hero-container">
            <div className="ttp-hero-content">
              <div className="ttp-hero-left">
                <div className="ttp-info-card">
                  <span className="ttp-info-badge">Since 2007</span>
                  <div className="ttp-info-icon">🎧</div>
                  <p className="ttp-info-text">
                    Unlimited 1-To-1 <br />
                    Doubt Sessions & <br />
                    24x7 Assistance
                  </p>
                  <div className="ttp-info-dots">
                    <span className="dot active"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>

                <div className="ttp-hero-headings">
                  <p className="ttp-hero-topline">
                    CRACK THE CAT. UNLOCK YOUR DREAM B-School.
                  </p>
                  <h1 className="ttp-hero-title">
                    India’s Most Trusted <br /> CAT Coaching Institute
                  </h1>
                  <p className="ttp-hero-tags">
                    99+ percentiler mentors | Concept-based learning | Personalized
                    strategy
                  </p>
                  <div className="ttp-hero-buttons">
                    <button className="ttp-btn ttp-btn-primary">
                      Start Your Prep
                    </button>
                    <button className="ttp-btn ttp-btn-secondary">
                      Download Free Resources
                    </button>
                  </div>
                </div>

                <div className="ttp-floating-links">
                  <div className="btn-pair-1">
                    <button>Events</button>
                    <button>Trainer</button>
                  </div>
                  <div className="btn-pair-2">
                    <button>Process</button>
                    <button>Curriculum</button>
                  </div>
                  <div className="btn-pair-3">
                    <button>Certification</button>
                    <button>FAQs</button>
                  </div>
                </div>
              </div>

              <div className="ttp-bottom-flex-row">
                <div className="ttp-review-box">
                  <div className="ttp-review-stars">
                    <span className="star">⭐</span>
                    <span className="star">⭐</span>
                    <span className="star">⭐</span>
                    <span className="star">⭐</span>
                    <span className="star">⭐</span>
                  </div>
                  <p className="ttp-review-text">
                    Trusted by 1,000+ <br />
                    Students on Their CAT Journey
                  </p>
                </div>

                <div className="ttp-image-box">
                  <LazyLoadImage
                    src={contactTeam}
                    alt="Team"
                    style={{ width: "100%", borderRadius: "12px" }}
                  />
                </div>

                <div className="ttp-success-box-info">
                  <div className="ttp-avatar-stack">
                    <LazyLoadImage src="https://i.pravatar.cc/40?img=1" alt="avatar" />
                    <LazyLoadImage src="https://i.pravatar.cc/40?img=2" alt="avatar" />
                    <LazyLoadImage src="https://i.pravatar.cc/40?img=3" alt="avatar" />
                    <LazyLoadImage src="https://i.pravatar.cc/40?img=4" alt="avatar" />
                    <LazyLoadImage src="https://i.pravatar.cc/40?img=5" alt="avatar" />
                    <LazyLoadImage src="https://i.pravatar.cc/40?img=6" alt="avatar" />
                  </div>
                  <p className="ttp-success-text">
                    1700+ Success Stories <span className="arrow">→</span>
                  </p>
                </div>
              </div>

              <div className="ttp-hero-curve">
                <svg
                  viewBox="0 0 1440 320"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  style={{ width: "100%", height: "120px", display: "block" }}
                >
                  <path fill="#ffffff" d="M0,0 C480,180 960,180 1440,0 L1440,320 L0,320 Z" />
                </svg>
              </div>
            </div>
          </section>

          <section className="tgw-cat-section">
            <div className="tgw-container">
              <h2 className="tgw-heading">What Is CAT And Why It Matters</h2>
              <p className="tgw-subtext">
                The Common Admission Test (CAT) is India’s premier management entrance exam
                for IIMs and top B <br />
                -Schools.It tests your Quantitative Ability, Verbal Ability, Data Interpretation,
                and Logical Reasoning under <br />
                intense time pressure.
              </p>

              <div className="tgw-info-boxes">
                <div className="tgw-info-card">
                  <p className="tgw-info-title">Exam Duration</p>
                  <p className="tgw-info-value">2 hours</p>
                </div>
                <div className="tgw-info-card">
                  <p className="tgw-info-title">Sections</p>
                  <p className="tgw-info-value">VARC | DILR | QA</p>
                </div>
                <div className="tgw-info-card">
                  <p className="tgw-info-title">Marking</p>
                  <p className="tgw-info-value">+3 for correct, -1 for wrong</p>
                </div>
              </div>

              <div className="tgw-whycat-section">
                <div className="tgw-whycat-text">
                  <h3>Why CAT matters?</h3>
                  <p>
                    Since 2007, TathaGat has helped thousands crack exams like CAT, XAT,
                    GMAT, and SNAP with expert mentors, concept-focused learning, and personalized
                    guidance in small batches.
                  </p>
                  <div className="tgw-tags">
                    <span>Gateway To Top B-Schools</span>
                    <span>Career Acceleration</span>
                    <span>Global Opportunities</span>
                    <span>Personal Transformation</span>
                  </div>
                </div>

                <div className="tgw-whycat-videos">
                  {[1, 2, 3, 4].map((v, i) => (
                    <div className="tgw-video-card" key={i}>
                      <iframe
                        src="https://www.youtube.com/embed/1x9lbk01Tn4"
                        title="YouTube video player"
                        allowFullScreen
                      ></iframe>
                      <div className="tgw-video-meta">
                        <p>Simran Kaur</p>
                        <strong>CAT 99.53%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="tgr-classroom">
            <div className="tgr-container">
              <h2 className="tgr-heading">
                Real classroom energy. Real concept clarity.
              </h2>
              <p className="tgr-subtext">
                Before you join us, see how we teach. Watch demo clips from our top faculty as they
                break down concepts, share strategies, and make learning engaging and effective.
              </p>

              <div className="tgr-filters">
                <button
                  className={`tgr-btn ${category === "all" ? "tgr-active" : ""}`}
                  onClick={() => setCategory("all")}
                >
                  All Categories
                </button>
                <button
                  className={`tgr-btn ${category === "quant" ? "tgr-active" : ""}`}
                  onClick={() => setCategory("quant")}
                >
                  QUANT
                </button>
                <button
                  className={`tgr-btn ${category === "varc" ? "tgr-active" : ""}`}
                  onClick={() => setCategory("varc")}
                >
                  VARC
                </button>
                <button
                  className={`tgr-btn ${category === "lrdi" ? "tgr-active" : ""}`}
                  onClick={() => setCategory("lrdi")}
                >
                  LRDI
                </button>
              </div>

              <div className="tgr-video-grid">
                {videosData[category].map((video) => (
                  <div className="tgr-video-card" key={video.id}>
                    <div className="tgr-video-thumbnail">
                      <iframe
                        width="100%"
                        height="200"
                        src={video.url}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="tgr-yt-frame"
                      ></iframe>
                    </div>
                    <div className="tgr-video-info">
                      <p className="tgr-video-label">Watch Video</p>
                      <h4 className="tgr-video-title">{video.title}</h4>
                      <p className="tgr-video-author">By {video.author}</p>
                      <a
                        className="tgr-watch-link"
                        href={video.url.replace("embed/", "watch?v=")}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Watch Now →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="tgc-score">
            <div className="tgc-container">
              <div className="tgc-graph-area">
                <div className="tgc-graph-box">
                  <h4 className="tgc-graph-title">Score Graph for CAT Scorers</h4>
                  <p className="tgc-graph-subtitle">99+ percentilers from TathaGat</p>
                  <div className="tgcs-image-box">
                    <LazyLoadImage src={graph2} alt="Score Graph" className="tgcs-fixed-img" />
                  </div>
                </div>
              </div>

              <div className="tgc-toppers">
                {[
                  { name: "Harshit Bhalla", score: "99.83 %ILE", img: image1 },
                  { name: "LUV Saxena", score: "99.33 %ILE", img: image3 },
                  { name: "Aditya Dang", score: "99.32 %ILE", img: image6 },
                  { name: "Harshit Bhalla", score: "99.2 %ILE", img: image5 },
                ].map((s, i) => (
                  <div className="tgc-topper-card" key={i}>
                    <div className="tgc-photo">
                      <LazyLoadImage src={s.img} alt={s.name} />
                      <div className="tgc-overlay">{s.name}</div>
                    </div>
                    <p className="tgc-score-text">{s.score}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>


        <Mycourse/>  


          {/* <section className="tspp-programs-section">
            <div className="tspp-programs-header">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  marginBottom: "-60px",
                }}
              >
                <h5>our Courses</h5>
                <h2>Tailored for Your Success</h2>
              </div>
              <div>
                <p>
                  At Tathagat, we offer comprehensive and specialized programs designed to help
                  students excel in CAT, XAT, SNAP, GMAT, and other management entrance exams.
                  Whether you're a beginner or looking for advanced training, we have the perfect
                  program for you!
                </p>
              </div>
            </div>

            <div className="tspp-programs-actions">
              <button>
                <i className="fa fa-filter"></i> filter
              </button>
              <button>
                <i className="fa fa-balance-scale"></i> Course Comparison
              </button>
            </div>

            <div className="tspp-programs-grid">
              {visibleCourses.map((item, index) => (
                <div className="tspp-program-card" key={index}>
                  <div className="tspp-program-image">
                    <LazyLoadImage effect="blur" src={item.image} alt={item.title} />
                    <div className="tspp-badge">Full Course</div>
                  </div>
                  <div className=" tspp-program-content">
                    <h3>{item.title}</h3>
                    <ul>
                      {item.features.map((feat, idx) => (
                        <li key={idx}>✔ {feat}</li>
                      ))} 
                    </ul>
                    <div className="tspp-program-price-row">
                      <div>
                        <h4>{item.price}</h4>
                        <del>{item.oldPrice}</del>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <button>{item.buttonLabel}</button>
                        <button>{item.buttonLabel2}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!showAll && (
              <div className="tspp-show-all-button">
                <button onClick={() => setShowAll(true)}>View All</button>
              </div>
            )}
          </section> */}

          <div className="cat-syllabus-container">
            <div className="cat-syllabus-left">
              <h1 className="cat-syllabus-title">CAT 2025 Syllabus</h1>

              {/* ===== TABS (functional) ===== */}
              <div className="cat-syllabus-tabs">
                <button
                  className={`cat-tab ${syllabusTab === "FULL" ? "active" : ""}`}
                  onClick={() => setSyllabusTab("FULL")}
                >
                  CAT 2025 QUANT Syllabus
                </button>
                <button
                  className={`cat-tab ${syllabusTab === "SEVENTY" ? "active" : ""}`}
                  onClick={() => setSyllabusTab("SEVENTY")}
                >
                  CAT 2025 VARC Syllabus
                </button>
                <button
                  className={`cat-tab ${syllabusTab === "ZERO" ? "active" : ""}`}
                  onClick={() => setSyllabusTab("ZERO")}
                >
                  CAT 2025 DILR Syllabus
                </button>
              </div>

              <h3 className="cat-section-title">
                Quant Section in CAT – Topic wise question distribution
              </h3>

              <table className="cat-syllabus-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>CAT 2022</th>
                    <th>CAT 2023</th>
                    <th>CAT 2024</th>
                  </tr>
                </thead>
                {/* ===== Dynamic body ===== */}
                <tbody>
                  {shownRows.map((row, i) =>
                    row.header ? (
                      <tr key={`h-${i}`}>
                        <td colSpan={4} style={{ fontWeight: 700, textAlign: "left" }}>
                          {row.header}
                        </td>
                      </tr>
                    ) : (
                      <tr key={`r-${i}`}>
                        <td>{row.topic}</td>
                        <td>{row.y2022 ?? ""}</td>
                        <td>{row.y2023 ?? ""}</td>
                        <td>{row.y2024 ?? ""}</td>
                      </tr>
                    )
                  )}
                  {shownRows.filter((r) => !r.header).length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No rows to show.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="cat-syllabus-right">
              <div className="cat-trust-box">
                <div className="cat-mentors">
                  <LazyLoadImage src={team} alt="Mentors" />
                </div>
                <div className="cat-trust-content">
                  <h3>Why Students Trust TathaGat</h3>
                  <p className="cat-trust-desc">
                    Since 2007, TathaGat has helped thousands crack exams like CAT, XAT, GMAT,
                    and SNAP with expert mentors, concept-focused learning, and personalized guidance
                    in small batches.
                  </p>
                  <ul className="cat-benefits">
                    <li>🟡 Personalized Attention</li>
                    <li>🟡 Concept-driven class</li>
                    <li>🟡 Practice Session</li>
                    <li>🟡 Doubts And Discussion</li>
                    <li>🟡 Mentors With 99+ Percentiles</li>
                    <li>🟡 Real-Time Strategy</li>
                    <li>🟡 Workshops</li>
                  </ul>
                  <div className="cat-support-box">
                    <h4>24*7 Support</h4>
                    <p>
                      TathaGat offers unlimited one-on-one doubt sessions, live class doubt resolution,
                      and round-the-clock assistance, ensuring no query goes unanswered. Expert mentorship
                      provides continuous support, boosting confidence and enhancing problem-solving skills
                      for exams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- THIS IS THE FIXED BUTTON ---------- */}
          <section className="tgv-top-section">
            <div className="tgv-top-header">
              <h2 className="tgv-top-heading">100%ile In CAT!</h2>
              <button
                type="button"
                className="tgv-view-btn"
                onClick={() => navigate("/score-card")}
              >
                View all
              </button>
            </div>

            {/* WRAPPER: cards (left) + know us (right) */}
            <div className="tgv-top-content">
              <div className="tgv-cards-container">
                {scorers.slice(0, 3).map((s, i) => (
                  <div className="tgv-card" key={i}>
                    <LazyLoadImage
                      src={scoreImages[i]}     // 3 alag images
                      alt={s.name || `Score ${i + 1}`}
                      className="img1"
                    />
                  </div>
                ))}
              </div>

              <div className="tgv-know-box">
                <h3 className="tgv-know-title">Know Us</h3>
                <p className="tgv-know-text">
                  <strong>TathaGat</strong> was established in 2007 by Rajat Tathagat with a vision to
                  revolutionize MBA entrance exam preparation. With a student-first approach, TathaGat
                  focuses on concept clarity, rigorous practice, and personalized mentoring to help
                  aspirants achieve 99+ percentiles. Over the years, it has built a reputation for
                  innovative pedagogy, expert faculty, and exceptional success rates.
                </p>
                <button className="tgv-about-btn">About Us</button>
              </div>
            </div>
          </section>

          {/* ---------- /FIXED BUTTON ---------- */}

          <div id="graph">
            <div className="tgt-growth-wrapper">
              <LazyLoadImage src={graph} alt="TathaGat Growth Chart" className="tgt-growth-img" />
            </div>

            <div className="tgi-iim-table-container">
              <h2 className="tgi-iim-title">IIM Calls Vs Percentile</h2>
              <div className="tgi-iim-table-wrapper">
                <table className="tgi-iim-table">
                  <thead>
                    <tr>
                      <th className="tgi-header red">Year</th>
                      <th className="tgi-header green">IIM Ahmedabad</th>
                      <th className="tgi-header pink">IIM Bangalore</th>
                      <th className="tgi-header orange">IIM Calcutta</th>
                      <th className="tgi-header yellow">IIM Lucknow</th>
                      <th className="tgi-header purple">IIM Kozhikode</th>
                      <th className="tgi-header cyan">IIM Indore</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data1.map((row, i) => (
                      <tr key={i}>
                        <td id="td11">{row.year}</td>
                        <td id="td1">{row.a}</td>
                        <td id="td2">{row.b}</td>
                        <td id="td3">{row.c}</td>
                        <td id="td4">{row.d}</td>
                        <td id="td5">{row.e}</td>
                        <td id="td6">{row.f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="tga-feedback-grid">
              {feedbackImages.map((src, index) => (
                <div className="tga-feedback-card" key={index}>
                  <LazyLoadImage
                    src={src}                           // <-- yahan score ki jagah src
                    alt={`Feedback ${index + 1}`}
                    className="tga-feedback-img"
                    effect="blur"
                  />
                </div>
              ))}
            </div>





          </div>
        </>
      </div >
    );
  };

  export default Cat;
