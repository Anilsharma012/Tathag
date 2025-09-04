import React from 'react'
import "./Resources.css"
import ResourcesPageOne from '../../subpages/ResourcesPageOne/ResourcesPageOne';


const videoLinks = [
  "J_QoDDzzbyI",
  "EHBQ3AJ-uEo",
  "IVnBi5uPHW0",
  "6X9qoILmlVs",
  "1x9lbk01Tn4",
  "VJK19CuaI9g"
];



const filters = [
  "CAT 2023 Slot 1, 2, 3 – With Solutions",
  "CAT 2023 Slot 1, 2, 3 – With Solutions",
  "CAT 2022 Slot 1, 2, 3 – With & Without Solutions",
  "CAT 2022 Slot 1, 2, 3 – With & Without Solutions",
  "CAT 2022 Slot 1, 2, 3 – With & Without Solutions",
];

const paperCards = Array(6).fill({
  date: "10 March 2024",
  title: "XAT Paper with Official Answer Key",
  tags: ["Logical Reasoning", "2024", "XAT"],
  pages: 8
});

const ResourcesPage = () => {
  return (
    <div>
      
      <div className="tf-resources-section">
      <div className="tf-resources-overlay">
        <div className="tf-resources-content">
          <div className="tf-left-section">
            <h1 className="tf-title">RESOURCES</h1>
            <button className="tf-enroll-btn">Enroll Now</button>
          </div>
          <div className="tf-right-section">
            <p>
              At Tathagat, we believe that the right guidance, the right practice, and the right strategy
              make all the difference. Here, you’ll find carefully curated study material, mock tests,
              previous year papers, preparation strategies, video lectures, and much more — everything
              you need to excel in CAT, XAT, SNAP, GMAT, and beyond.
            </p>
          </div>
        </div>
      </div>
    </div>



    <div className="tf-study-section">
      <div className="tf-top-filters">
        <div className="tf-buttons-left">
          <button className="tf-btn tf-btn-active">All Category</button>
          <button className="tf-btn">Study Materials</button>
          <button className="tf-btn">Video Lectures</button>
          <button className="tf-btn">Previous Year Papers</button>
        </div>
        <div className="tf-filter-btn">
          <button className="tf-btn tf-icon-btn">Filter <span>🔍</span></button>
        </div>
      </div>

      <div className="tf-study-content">
        <div className="tf-left">
          <p className="tf-tag">STUDY MATERIALS</p>
          <h2 className="tf-heading">Strengthen Your Basics and<br />Master Every Concept</h2>
        </div>
        <div className="tf-right">
          <p className="tf-description">
            Our comprehensive study material covers all major sections — Quantitative Aptitude, Verbal Ability,
            Logical Reasoning, and Data Interpretation. Whether you are starting fresh or refining your skills,
            these materials provide clear explanations, solved examples, and practice sets designed by our expert faculty.
            Download topic-wise notes and concept sheets to make your learning efficient.
          </p>
        </div>
      </div>
    </div>



    <div className="tf-grid-wrapper">
      {Array(8).fill(0).map((_, index) => (
        <div className="tf-grid-card" key={index}>
          <div className="tf-card-header">
            <div className="tf-icon-circle">📄</div>
            <span className="tf-doc-type">Document</span>
          </div>
          <h3 className="tf-doc-title">Arithmetic Essentials (PDF)</h3>
          <p className="tf-doc-desc">
            Covers Percentages, Profit & Loss, Ratio-Proportion, Averages, and Time-Speed-Distance with examples.
          </p>
          <button className="tf-download-btn">
            Download PDF 2 MB <span className="tf-download-icon">⬇️</span>
          </button>
        </div>
      ))}
    </div>



    <div className="tf-video-section">
      <div className="tf-video-header">
        <div>
          <h2 className="tf-video-title">Video Lectures</h2>
          <p className="tf-video-subtitle">Learn from the Best, Anytime and Anywhere</p>
        </div>
        <button className="tf-signup-btn">Sign Up</button>
      </div>

      <div className="tf-video-grid">
        {videoLinks.map((id, index) => (
          <a
            key={index}
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tf-video-card"
          >
            <div className="tf-video-thumb">
              <img
                src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                alt="Video thumbnail"
              />
              <div className="tf-play-icon">▶</div>
            </div>
            <div className="tf-video-info">
              <p className="tf-watch-label">Watch Video</p>
              <h3 className="tf-video-desc">Why CAT from TathaGat is important?</h3>
            </div>
          </a>
        ))}
      </div>
    </div>





    <div className="tf-pyp-section">
      <div className="tf-pyp-heading">
        <h2 className="tf-pyp-title">Previous Year Papers</h2>
        <p className="tf-pyp-subtitle">Learn from the Past, Excel in the Future</p>
      </div>

      <div className="tf-pyp-grid">
        {/* Left Filters */}
        <div className="tf-pyp-filters">
          <h3>Available Papers</h3>
          <div className="tf-pyp-category">
  <div className="tf-category-header">CAT <span className="tf-dropdown-icon">⌄</span></div>
  {filters.map((item, idx) => (
    <label key={idx} className="tf-checkbox">
      <input type="checkbox" />
      <span>{item}</span>
    </label>
  ))}
</div>


          <div className="tf-pyp-category">XAT <span className="tf-dropdown-icon">⌄</span></div>
          <div className="tf-pyp-category">SNAP <span className="tf-dropdown-icon">⌄</span></div>
          <div className="tf-pyp-category">GMAT <span className="tf-dropdown-icon">⌄</span></div>
        </div>

        {/* Right Papers */}
        <div className="tf-pyp-cards">
          {paperCards.map((paper, idx) => (
            <div className="tf-paper-carding" key={idx}>
              <div className="tf-paper-top">
                <span>{paper.date}</span>
                <span className="tf-pages">{paper.pages} Pages</span>
              </div>
              <h4 className="tf-paper-title">{paper.title}</h4>
              <div className="tf-tags">
                {paper.tags.map((tag, index) => (
                  <span key={index} className="tf-tag">{tag}</span>
                ))}
              </div>
              <div className="tf-download-icon">⬇️</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <ResourcesPageOne/>


    </div>
  )
}

export default ResourcesPage
