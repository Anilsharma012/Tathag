import React, { useState } from "react";
import "./FinalResource.css";

import team from "../../images/contactTeams.png";
import { Navigate, useNavigate } from "react-router-dom";
import ExploreBlog from "../../components/ExploreBlog/ExploreBlog";
import faqImage from "../../images/faqOne.png"


const FinalResource = () => {
  const navigate = useNavigate();

  // For CAT & OMET
  const [filter, setFilter] = useState("all");
  const [showPopup, setShowPopup] = useState(false);

  const mockTests = [
    { id: 1, title: "CAT 2024  Paper Slot 1", category: "cat" },
    { id: 2, title: "XAT 2024 Paper Slot 2", category: "xat" },
    { id: 3, title: "SNAP 2024 Paper", category: "snap" },
    { id: 4, title: "CAT 2023 Paper Slot 1", category: "cat" },
    { id: 5, title: "MHCET 2023 Paper", category: "mhcet" },
    { id: 1, title: "CAT 2024  Paper Slot 1", category: "cat" },
  ];

  const filteredTests = filter === "all" ? mockTests : mockTests.filter(test => test.category === filter);

  // For STUDY MATERIALS GRID
  const [smFilter, setSmFilter] = useState("All");
  const smData = [
    { id: 1, category: "Study Materials", title: "Arithmetic Essentials (PDF)" },
    { id: 2, category: "Video Lectures", title: "Geometry Masterclass (Video)" },
    { id: 3, category: "Previous Year Papers", title: "CAT 2023 Paper (PDF)" },
    { id: 4, category: "Study Materials", title: "Algebra Core Concepts (PDF)" },
    { id: 5, category: "Video Lectures", title: "Logical Reasoning Tricks (Video)" },
    { id: 6, category: "Previous Year Papers", title: "XAT 2023 Paper (PDF)" },
    { id: 2, category: "Video Lectures", title: "Geometry Masterclass (Video)" },
    { id: 1, category: "Study Materials", title: "Arithmetic Essentials (PDF)" },

  ];
  const smFiltered = smFilter === "All" ? smData : smData.filter(d => d.category === smFilter);

  return (
    <>
      <div id="page2">
        <section className="m-section">
          <div className="m-container">
            <div className="m-left">
              <p className="m-subtitle">
                EVERYTHING YOU NEED TO BUILD STRONG <br /> FOUNDATIONS
              </p>
              <h1 className="m-title">
                Master The CAT With <br />
                Precision
              </h1>
              <p className="m-description">
                Download expert-curated study material, notes, and past papers
                — everything you need to level up your preparation.
              </p>
              <h3 className="m-tools-heading">
                Kickstart Your Prep with Free & Powerful Tools
              </h3>
              <div className="m-buttons-wrapper">
                <div className="m-buttons">
                  <button className="m-btn m-btn-light" onClick={() => setShowPopup(true)}>PERCENTILE PREDICTOR</button>
                  <button className="m-btn m-btn-light" onClick={() => setShowPopup(true)}>VIDEO TESTIMONIALS</button>
                  <button className="m-btn m-btn-light" onClick={() => setShowPopup(true)}>CAT & OME PYQS</button>
                  <button className="m-btn m-btn-primary" onClick={() => setShowPopup(true)}>                  
                    CAT & OMET SYLLABOS AND STRATEGY                                                                                                                                                                                                                                                                                             
                  </button>
                </div>
              </div>
              {showPopup && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                  <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    <p>COMING SOON</p>
                    <button onClick={() => setShowPopup(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>

            <div className="m-right">
              {[
                {
                  date: "10 March 2025",
                  pages: "8 Pages",
                  title: "XAT Paper with Answer Key",
                  desc: "Download detailed PDF notes covering all key Quant topics."
                },
                {
                  date: "12 March 2025",
                  pages: "10 Pages",
                  title: "CAT Mock Test 2025",
                  desc: "Practice with full-length CAT mock test and solutions."
                },
                {
                  date: "15 March 2025",
                  pages: "6 Pages",
                  title: "SNAP Sample Questions",
                  desc: "Access SNAP sample questions with expert solutions."
                },
                {
                  date: "20 March 2025",
                  pages: "5 Pages",
                  title: "GMAT Quant Guide",
                  desc: "Quick revision guide for GMAT quant section."
                }
              ].map((item, index) => (
                <div key={index} className="m-card">
                  <div className="m-card-header">
                    <span>{item.date}</span>
                    <span className="m-pages">{item.pages}</span>
                  </div>
                  <h3 className="m-card-title">{item.title}</h3>
                  <p className="m-card-description">
                    {item.desc}
                  </p>
                  <div className="m-card-actions">
                    <button className="m-btn m-btn-outline">View</button>
                    <span className="m-download">⬇</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </div>

      <section className="b-section">
        <div className="b-container">
          <h2 className="b-heading">Boost Your Brainpower Daily & Monthly</h2>

          <div className="b-featured">
            <h4 className="b-subheading">Featured Categories</h4>
            <div className="b-category-list">
              {[
                "QUANT",
                "LRDI",
                "VARC",
                "GK",
                "VOCAB",
                "ALL QUESTIONS",
              ].map((cat, i) => (
                <div key={i} className="b-category-item">
                  <div className="b-icon">📘</div>
                  <div className="b-label">
                    <div className="b-name">{cat}</div>
                    <div className="b-count">200+ Questions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="b-card-wrapper">
            <div className="b-card">
              <div className="b-card-top">
                <span className="b-icon-round">Topic</span>
                <span className="b-tag">New Question</span>
              </div>
              <h3 className="b-question">
                Sharpen your skills with today’s quick challenge!
              </h3>
              <p className="b-desc">
                Daily corected problem to test your accoury and speed{" "}
              </p>
              <p className="b-bdesc">What is the value of x in 3x + 5 = 20</p>
              <ul className="b-options">
                <li>(A) 3</li>
                <li className="b-correct">(B) 5</li>
                <li>(C) 6</li>
                <li>(D) 4</li>
              </ul>
              <div className="b-buttons">
                <button className="b-btn b-btn-pink">Submit Answer</button>
                <button className="b-btn b-btn-outline">Correct Answer</button>
                <button className="b-btn b-btn-outline">Discuss</button>
              </div>
            </div>

            {[
              { icon: "📘", tag: "Previous Question" },
              { icon: "📙", tag: "Older Question" }
            ].map((item, i) => (
              <div key={i} className="b-card">
                <div className="b-card-top">
                  <span className="b-icon-round">{item.icon}</span>
                  <span className="b-tag">{item.tag}</span>
                </div>
                <h3 className="b-question">Take on the ultimate challenge!</h3>
                <p className="b-bbdesc">
                  This handpicked question is designed to push your limits and
                  test deep conceptual understanding.
                </p>
                <p className="b-highlight">
                  Winners get featured on our leaderboard!
                </p>
                <div className="b-profile-strip">
                  {/* <div className="b-profile-text">
    Harsh Thakral
    <br />
    98.83 %ILE
  </div> */}
                  <div className="b-buttons">
                    <button className="b-btn b-btn-pink">Submit Answer</button>
                    {/* <button className="b-btn b-btn-outline">Correct Answer</button>
                    <button className="b-btn b-btn-outline">Discuss</button> */}
                  </div>
                </div>
                {/* <div className="b-avatars">👤 👤 👤 +50</div> */}
              </div>
            ))}

          </div>
        </div>
      </section>



      <section className="tgsm-section">
        <div className="tgsm-container">
          <div className="tgsm-header">
            <div className="tgsm-left">
              <p className="tgsm-label">STUDY MATERIALS</p>
              <h2 className="tgsm-title">Strengthen Your Basics and Master Every Concept</h2>
            </div>
            <div className="tgsm-right">
              <p className="tgsm-desc">
                Our comprehensive study material covers all major sections — Quantitative Aptitude, Verbal Ability, Logical Reasoning, and Data Interpretation. Whether you are starting fresh or refining your skills, these materials provide clear explanations, solved examples.
              </p>
            </div>
          </div>
          <div className="tgsm-buttons-wrapper">
            <div className="tgsm-buttons">
              <button className={`tgsm-btn ${smFilter === "All" ? "tgsm-btn-active" : ""}`} onClick={() => setSmFilter("All")}>All Category</button>
              <button className={`tgsm-btn ${smFilter === "Study Materials" ? "tgsm-btn-active" : ""}`} onClick={() => setSmFilter("Study Materials")}>Study Materials</button>
              <button className={`tgsm-btn ${smFilter === "Video Lectures" ? "tgsm-btn-active" : ""}`} onClick={() => setSmFilter("Video Lectures")}>Video Lectures</button>
              <button className={`tgsm-btn ${smFilter === "Previous Year Papers" ? "tgsm-btn-active" : ""}`} onClick={() => setSmFilter("Previous Year Papers")}>Previous Year Papers</button>
              <button className="tgsm-btn tgsm-btn-filter">Filter 🔽</button>
            </div>
          </div>


          <div className="tgsm-grid">
            {smFiltered.map((item) => (
              <div key={item.id} className="tgsm-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "90px" }}>
                  <div className="tgsm-icon">📄</div>
                  <div className="tgsm-doc">{item.category}</div>
                </div>
                <h3 className="tgsm-doc-title">{item.title}</h3>
                <p className="tgsm-doc-desc">Covers Percentages, Profit & Loss, Ratio-Proportion, Averages, and Time-Speed-Distance with examples.</p>
                <button className="tgsm-btn tgsm-btn-download">Download PDF 2 MB <span className="tgsm-icon-download">⬇</span></button>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="h-section">
        <div className="h-container">
          <div className="h-left">
            <h2 className="h-title">Hack To ACE</h2>
            <p className="h-desc">
              Crack the CAT with strategic resources designed to boost your
              accuracy, speed, and awareness. Whether you’re brushing up
              formulas, staying current with the world, or deep diving into
              expert-written guides – this is your one-stop hub.
            </p>
            <div className="h-scroll-vertical">
              <div className="h-block">
                <h4 className="h-sub">Quant Formulae Book</h4>
                <p className="h-text">
                  Struggling with speed in QA? Get access to a comprehensive list
                  of formulas and tricks for topics like Arithmetic, Algebra,
                  Geometry, and more.
                </p>
                <div className="h-tags">
                  <button className="h-btn h-btn-outline">
                    📘 Topic-Wise Formulae for Quick Revision
                  </button>
                  <button className="h-btn h-btn-outline">
                    📘 Question Bank
                  </button>
                </div>
              </div>

              {[
                {
                  heading: "VARC VAULT ",
                  desc: "VARC is usually the first  Section in CAT . It is imperative to master this section it you want to score well.",
                  button1: "📘 100 RCs Starter Set",
                  button2: "📘 VARC Question Bank"
                },
                {
                  heading: "DILR Compendium ",
                  desc: "DILR is not tought in any School or College making it a totally non-traditional section .Our unique pedagogy ensures that you ace this section.  ",
                  button1: "📘 DILR 360°",
                  button2: "📘 DILR Question Bank"
                },
                {
                  heading: "Daily Gk &Current Affairs",
                  desc: "Designed for advanced learners aiming to master GK. Includes high-difficulty RCs and exclusive practice sets.",
                  button1: "📘 GK",
                  button2: "📘 VOcab"
                }
              ].map((item, i) => (
                <div className="h-block" key={i}>
                  <h4 className="h-sub">{item.heading}</h4>
                  <p className="h-text">{item.desc}</p>
                  <div className="h-tags">
                    <button className="h-btn h-btn-outline">{item.button1}</button>
                    <button className="h-btn h-btn-outline">{item.button2}</button>
                  </div>
                </div>
              ))}</div>


          </div>

          <div className="h-right">
            {[
              {
                title: "Popular Blogs",
                topic: "Verbal Ability: How to Improve Reading Comprehension Scores Quickly",
                author: "By TathaGat Faculty"
              },
              {
                title: "Popular Blogs",
                topic: "Quantitative Aptitude: Tricks to Solve Questions Faster",
                author: "By TathaGat Faculty"
              },
              {
                title: "Popular Blogs",
                topic: "Logical Reasoning: Key Strategies for CAT",
                author: "By TathaGat Faculty"
              },
              {
                title: "Popular Blogs",
                topic: "Data Interpretation: How to Master Charts and Graphs",
                author: "By TathaGat Faculty"
              }
            ].map((item, i) => (
              <div key={i} className="h-blog">
                <h5 className="h-blog-title">{item.title}</h5>
                <p onClick={() => navigate('/ourBlog')} className="h-blog-topic">{item.topic}</p>
                <span className="h-author">{item.author}</span>
                <hr className="h-divider" />
              </div>
            ))}
          </div>

        </div>
      </section>









      <div className="c-cat-mock-container">
        <h1 className="c-page-title">CAT & OMET Previous Years' Papers</h1>

        <div className="c-filter-buttons-wrapper">
          <div className="c-filter-buttons">
            <button className={filter === "all" ? "c-active" : ""} onClick={() => setFilter("all")}>All Exams</button>
            <button className={filter === "cat" ? "c-active" : ""} onClick={() => setFilter("cat")}>CAT</button>
            <button className={filter === "xat" ? "c-active" : ""} onClick={() => setFilter("xat")}>XAT</button>
            <button className={filter === "snap" ? "c-active" : ""} onClick={() => setFilter("snap")}>SNAP</button>
            <button className={filter === "mhcet" ? "c-active" : ""} onClick={() => setFilter("mhcet")}>MHCET</button>
          </div>
        </div>


        <div className="c-test-grid">
          {filteredTests.map(test => (
            <div key={test.id} className="c-test-card">
              <div className="c-test-header">
                <div className="c-labels">
                  <span className="c-label free">Free</span>
                  <span className="c-label must">Must Attempt</span>
                </div>
                <button className="c-attempt-btn" onClick={() => navigate("/instruction")}>Attempt Now</button>
              </div>
              <h3 className="c-test-title">{test.title}</h3>
              <div className="c-test-meta">
                <span>📘 100 Questions</span>
                <span>📊 100 Marks</span>
                <span>⏱ 90 Minutes</span>
              </div>
              <div className="c-footer">{test.category.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {showPopup && (
          <div className="c-popup-overlay" onClick={() => setShowPopup(false)}>
            <div className="c-popup" onClick={e => e.stopPropagation()}>
              <p>COMING SOON</p>
              <button className="c-popup-close" onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        )}
      </div>








      <section className="e-section">
        <div className="e-container">
          <h2 className="e-heading">
            Concepts Made Clear - One Video At A Time.
          </h2>

          <div className="e-row">
            <div className="e-left">
              <div className="e-row-header">
                <h4>Meet the team</h4>
                <button className="e-btn-view" onClick={() => navigate('/team')}>View all</button>
              </div>
              <img src={team} alt="TathaGat Team" className="e-team-img" />
            </div>

            <div className="e-right">
              <div className="e-row-header">
                <h4>Free Youtube Videos</h4>
                <button className="e-btn-view" onClick={() => navigate('/Testimonial')} >View all</button>
              </div>

              <div className="e-video-grid">
                <div className="e-video-card">
                  <iframe
                    width="100%"
                    height="200"
                    src="https://www.youtube.com/embed/225nf-EhPkU?si=yXD9kMC-ui5Wmgcz"
                    title="Time & Work in 5 Minutes"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <div className="e-video-info">
                    <p className="e-tag">Watch Video</p>
                    <h5 className="e-video-title">Time & Work in 5 Minutes</h5>
                    <p className="e-author">By Ayush Kumar</p>
                    <p className="e-watch">Watch Now →</p>
                  </div>
                </div>

                <div className="e-video-card">
                  <iframe
                    width="100%"
                    height="200"
                    src="https://www.youtube.com/embed/FjJFwkabeok?si=5aIxNKe_yAyxUst_"
                    title="Time & Work in 5 Minutes"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <div className="e-video-info">
                    <p className="e-tag">Watch Video</p>
                    <h5 className="e-video-title">Time & Work in 5 Minutes</h5>
                    <p className="e-author">By Ayush Kumar</p>
                    <p className="e-watch">Watch Now →</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="tf-section-wrapper">
        {/* Left Box */}
        <div className="tg-telegram-box">
          <h2 className="tg-heading">Join Our Telegram Channel</h2>
          <p className="tg-subtext">
            Get instant updates on exam strategies, free study materials, daily quizzes,
            important deadlines, and direct mentor tips — all in one place.
          </p>

          <div className="tg-tags">
            <span className="tg-tag">✅ Exclusive Resources</span>
            <span className="tg-tag">✅ Doubt-Solving With Mentors</span>
            <span className="tg-tag">✅ GK & Current Affairs Updates</span>
            <span className="tg-tag">✅ Peer Discussions And Motivation</span>
          </div>

          <p className="tg-bottom-text">
            <span className="tg-highlight">Be part of the TathaGat learning community!</span>
          </p>
        </div>

        {/* Right Box */}
        <div
          className="tf-telegram-box"
          style={{ backgroundImage: `url(${faqImage})` }}
        >
          <div className="tf-telegram-overlay">
            <h3 className="tf-telegram-text">
              Join our Free Telegram<br />Discussion Group!
            </h3>
            <button className="tf-telegram-btn">Join now</button>
          </div>
        </div>
      </div>

      <ExploreBlog />

    </>
  );
};

export default FinalResource;