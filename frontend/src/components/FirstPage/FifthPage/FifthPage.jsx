import React, { useEffect, useState } from "react";
import "./FifthPage.css";
import learn2 from "../../../images/learningTwo.png";
import learn4 from "../../../images/learningFour.png";
import learn5 from "../../../images/learn5.jpeg";
import learn6 from "../../../images/ourClass.jpg";
import LazyImage from "../../LazyImage/LazyImage";

const stats = [
  { label: "Videos", target: 2000 },
  { label: "Questions", target: 25000 },
  { label: "Tests", target: 1000 },
];

const allVideos = {
  "All Categories": [
    { id: 1, title: "RC Video 1", embed: "https://www.youtube.com/embed/225nf-EhPkU?si=yXD9kMC-ui5Wmgcz" },
    { id: 2, title: "Arithmetic 1", embed: "https://www.youtube.com/embed/FjJFwkabeok?si=5aIxNKe_yAyxUst_" },
    { id: 3, title: "PYQ Verbal 1", embed: "https://www.youtube.com/embed/0lwJNmHaDVE?si=Mfu0dTd6OEN2RB-9" },
    { id: 4, title: "PYQ Quant 1", embed: "https://www.youtube.com/embed/y90UZ1IfpKc?si=cJN7pu1RzohAN7fT" },
  ],
  "Reading Comprehension": [
    { id: 1, title: "RC Video 1", embed: "https://www.youtube.com/embed/225nf-EhPkU?si=yXD9kMC-ui5Wmgcz" },
    { id: 2, title: "RC Video 2", embed: "https://www.youtube.com/embed/5KiVnNfsHa0?si=HTAEf-5lf759-A25" },
  ],
  "Arithmetic": [
    { id: 1, title: "Arithmetic 1", embed: "https://www.youtube.com/embed/FjJFwkabeok?si=5aIxNKe_yAyxUst_" },
    { id: 2, title: "Arithmetic 2", embed: "https://www.youtube.com/embed/xB-0s8lGwu0?si=169mNmzPrDLfFgBM" },
  ],
  "Previous Year Questions": [
    { id: 1, title: "PYQ Verbal 1", embed: "https://www.youtube.com/embed/0lwJNmHaDVE?si=Mfu0dTd6OEN2RB-9" },
    { id: 2, title: "PYQ Quant 1", embed: "https://www.youtube.com/embed/y90UZ1IfpKc?si=cJN7pu1RzohAN7fT" },
  ],
  "Preparation Strategy": [
    { id: 1, title: "Strategy 1", embed: "https://www.youtube.com/embed/Y2DEkcUnDpA?si=SZGB8mhrbUcBOVmK" },
    { id: 2, title: "Strategy 2", embed: "https://www.youtube.com/embed/Q3NZEj5EpJw?si=_hU9brQqC11I5ZMP" },
  ],
};

const FifthPage = () => {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [filteredVideos, setFilteredVideos] = useState(allVideos["All Categories"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((count, i) => {
          const inc = Math.ceil(stats[i].target / 30);
          return count + inc >= stats[i].target ? stats[i].target : count + inc;
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setFilteredVideos(allVideos[category]);
  };

  return (
    <>
      {/* 🌟 Learning Section */}
      <section className="tgf-learning-section">
        <div className="tgf-learning-header">
          <div className="tgf-learning-left">
            <p className="tgf-sub">OUR APPROACH</p>
            <h2 className="tgf-title">TathaGat Model of learning</h2>
          </div>
          <div className="tgf-learning-right">
            <p className="tgf-desc">
              Master concepts, sharpen strategies, and excel with personalized
              learning, AI-driven analytics, expert mentorship, and rigorous
              practice for top B-school admissions.
            </p>
            <button className="tgf-btn">Learn More</button>
          </div>
        </div>

        <div className="tgf-learning-cards">
          {[
            { number: "01", title: "Building a Strong Foundation", desc: "Our interactive live classes, spanning over 800 hours, ensure that every concept is taught from the very basic level to the most advanced, leaving no room for assumptions. This ensures a solid understanding, regardless of your prior knowledge", color: "#F9B233", image: learn6 },
            { number: "02", title: "Concept Application", desc: " Our application classes focus on demonstrating how to use the learned concepts to solve problems, thereby strengthening your understanding and building confidence", color: "#F9B233", image: learn2 },
            { number: "03", title: "Intensive Practice", desc: " We believe in learning by doing. Our practice sessions go beyond direct application, challenging you with a wider pool of questions that often involve the simultaneous application of multiple concepts, making you truly .", color: "#F77A4B", image: learn4 },
            { number: "04", title: "The Power of Workshops", desc: " These question-intensive sessions provide an unparalleled opportunity for focused practice, revision, application, and strategy development on key topics. Students often find that attending a workshop transforms them into a .", color: "#F77A4B", image: learn5 }
          ].map((card, idx) => (
            <div key={idx} className="tgf-card" style={{ backgroundColor: card.color }}>
              <div className="tgf-notch" style={{ borderLeftColor: card.color }}></div>
      
              <div className="tgf-card-content">
                <div className="tgf-header-row">
                  <span className="tgf-number">{card.number}</span>
                  <h3 className="tgf-card-title">{card.title}</h3>
                </div>
                <p className="tgf-card-desc">{card.desc}</p>
              </div>

              <div className="tgf-card-image-wrapper">
                <LazyImage src={card.image} alt={card.title} className="tgf-card-image" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 CAT Resources Section */}
      <section className="tfp-cat-section">
        <div className="tfp-cat-left">
          <h2 className="tfp-cat-heading">Access your free CAT resources!</h2>
          <p className="tfp-cat-paragraph">Unlock a treasure trove of study materials, tips, and strategies—absolutely free!</p>
          <div className="tfp-cat-stats">
            {stats.map((item, idx) => (
              <div className="tfp-stat-box" key={idx}>
                <div className="tfp-stat-number">{counts[idx]}+</div>
                <div className="tfp-stat-label">{item.label}</div>
              </div>
            ))}
            <div className="tfp-tat-box">
              <div className="tfp-stat-text"><strong>Weekly Practice</strong><br />Questions</div>
              <div className="tfp-stat-icon">↗</div>
            </div>
          </div>
        </div>
        <div className="tfp-cat-right">
          <button className="tfp-signup-btn">Sign Up Now</button>
        </div>
      </section>

      {/* 🌟 Video Section */}
      <section className="video-section">
        <div className="video-header-buttons">
          {Object.keys(allVideos).map((cat) => (
            <button
              key={cat}
              className={`video-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          className="video-cards"
          style={{
            overflowX: "auto",
            display: "flex",
            gap: "24px",
            padding: "10px",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
          }}
        >
          {filteredVideos.map((video) => (
            <div
              className="video-carding"
              key={video.id}
              style={{
                flex: "0 0 auto",
                width: "360px",
                scrollSnapAlign: "start",
              }}
            >
              <div className="video-frame">
                <iframe
                  src={video.embed}
                  title={video.title}
                  frameBorder="0"
                  allowFullScreen
                  style={{ width: "100%", height: "280px", borderRadius: "16px 16px 0 0" }}
                ></iframe>
              </div>
              <div className="video-info">
                <span className="watch-label">Watch Video</span>
                <h4>{video.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default FifthPage;