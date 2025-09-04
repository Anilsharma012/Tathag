import React, { useRef, useState } from "react";
import "./CourseDetails.css";

import rajat from "../../images/Team/Rajat 5.png";
import kumar from "../../images/Team/KumarSir.png";
import niraj from "../../images/Team/Niraj-Sir.png";
import testimonial1 from "../../images/aa.PNG";
import testimonial2 from "../../images/ab.PNG";
import testimonial3 from "../../images/ac.PNG";
import testimonial4 from "../../images/ad.PNG";
import testimonial5 from "../../images/ae.PNG";

import revieww2 from "../../images/Review/R10.PNG"
import revieww3 from "../../images/Review/R9.PNG"
import revieww4 from "../../images/Review/R7.PNG"

import review1 from "../../images/Review2/success-two.PNG";
import review2 from "../../images/Review2/success-three.PNG";
import review3 from "../../images/Review2/success-four.PNG";
import review4 from "../../images/Review2/success-five.PNG";
import review5 from "../../images/Review/R5.PNG";
import review6 from "../../images/Review/R6.PNG";
import review7 from "../../images/Review/R7.PNG";
import review8 from "../../images/Review/R8.PNG";
import review9 from "../../images/Review/R9.PNG";
import review10 from "../../images/Review/R10.PNG";
import review11 from "../../images/Review/R2.PNG";
import review12 from "../../images/Review/R4.PNG";

import journeyStartImg from "../../images/testimonial-Banner.png";

import aboutFour from "../../images/learningTwo.png";
import aboutthree from "../../images/learningFour.png";
import aboutTwo from "../../images/learn5.jpeg";
import aboutOne from "../../images/ourClass.jpg";

// NOTE: removed unused import: coursePic

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import ExploreBlog from "../../components/ExploreBlog/ExploreBlog";
import Mycourse from "../../components/MyCourses/Mycourse";
import CourseComprasion from "../../components/CourseComprasion/CourseComprasion";

const CourseDetails = () => {
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const rajatRef = useRef(null);

  // NOTE: removed unused constants: months, courseFeatureList, steps, testim

  const galleryImages = [
    review1,
    review2,
    review3,
    review4,
    review5,
    review6,
    review7,
    review8,
    review9,
    review10,
    review11,
    review12,
  ];

  const testimonials = [testimonial1, testimonial2, testimonial3, testimonial4, testimonial5];

  const videos = [
    {
      link: "https://youtu.be/J_QoDDzzbyI",
      category: "QUANT",
      title: "Time & Work in 5 Minutes",
      
    },
    {
      link: "https://youtu.be/EHBQ3AJ-uEo",
      category: "VARC",
      title: "RC Strategies",
    
    },
    {
      link: "https://youtu.be/IVnBi5uPHW0",
      category: "LRDI",
      title: "Puzzle Solving",
     
    },
    {
      link: "https://youtu.be/1x9lbk01Tn4",
      category: "QUANT",
      title: "Number System Basics",
     
    },
    {
      link: "https://youtu.be/Ctb23J-46cM",
      category: "VARC",
      title: "Para Jumbles Tricks",
      
    },
    {
      link: "https://youtu.be/6ODXAKkACS4",
      category: "LRDI",
      title: "Seating Arrangement",
      
    },
    {
      link: "https://youtu.be/JHgNoNlucTg",
      category: "QUANT",
      title: "Geometry Quick Revision",
      
    },
  ];

  const visibleVideos =
    activeCategory === "All" ? videos : videos.filter((v) => v.category === activeCategory);

  const cards = [
    {
      number: "01",
      title: "Strong Quant Foundation",
      description:
        "Tathagat’s expertise in Quantitative Aptitude ensures you're well-prepared for the toughest part of IPMAT — with deep conceptual clarity and smart shortcuts.",
      image: aboutOne,
      bgColor: "#FBAF17",
    },
    {
      number: "02",
      title: "Focused Verbal Training",
      description:
        "Our modules sharpen your reading comprehension, grammar, and vocabulary to tackle the Verbal Ability section with precision and confidence.",
      image: aboutTwo,
      bgColor: "#FBAF17",
    },
    {
      number: "03",
      title: "Regular Mocks & Performance Analysis",
      description:
        "Experience real IPMAT-level mocks with detailed feedback, time analysis, and strategy tweaks to maximize your scores.",
      image: aboutthree,
      bgColor: "#FC6D4F",
    },
    {
      number: "04",
      title: "Expert Guidance & Personal Mentorship",
      description:
        "With small batch sizes and experienced faculty, you get personal attention and mentorship tailored to your strengths and weaknesses.",
      image: aboutFour,
      bgColor: "#FC6D4F",
    },
  ];

  return (
    <div>
      <div className="tgz-hero-container">
        {/* Left Section */}
        <div className="tgz-hero-left">
          <h1 className="tgz-hero-heading">
            Start Preparing Smart <br />
            <span className="tgz-highlight">
              Let’s hit 99+ <span className="tgz-highlight1">together</span>
            </span>
          </h1>

          <p className="tgz-hero-subtext">
            Explore our tailored programs for CAT, XAT,
            <br /> SNAP, GMAT and more.
          </p>
          <button className="tgz-hero-primary-btn">Book a Free Counselling Session</button>

          <div className="tgz-hero-buttons">
            {["Free Mocks", " IIM Predictor", "Our Courses", "Free Resources", "Success Stories", "FAQs"].map(
              (label, idx) => (
                <button key={idx} className="tgz-hero-secondary-btn">
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="tgz-hero-right">
          <div className="tg-hero-video-wrapper">
            <iframe
              className="tg-hero-video"
              src="https://www.youtube.com/embed/hRiB234YHjs"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      <Mycourse />

      <div className="rajat-container" ref={rajatRef}>
        <div className="rajat-top">
          <div className="rajat-image">
            <LazyLoadImage src={rajat} effect="blur" alt="Rajat Kumar" />
          </div>
          <div className="rajat-content">
            <h1>Rajat Kumar</h1>
            <h3 className="rajat-title">An IIT Alumnus with 18+ Years of Excellence in CAT Training</h3>
            <p>
              With over 18 years of experience mentoring aspirants for CAT and other management exams, he
              brings a rare blend of academic strength, progressive thinking, and entrepreneurial vision.
              His uncompromising focus on quality and student outcomes has been instrumental in establishing
              TathaGat as one of the most trusted names in MBA test prep. Passionate about excellence, he
              continues to inspire students to aim higher and achieve the best in their careers.
            </p>
            <button className="tgv-rjt-button">Book Free Counselling</button>
          </div>
          <div className="rajat-side-faces">
            <LazyLoadImage effect="blur" src={kumar} alt="Kumar Abhishek" />
            <LazyLoadImage effect="blur" src={niraj} alt="Niraj Naiyar" />
          </div>
        </div>
        <div className="testimonial-part">
          <h2 className="testimonial-heading">Testimonial</h2>
          <div className="testimonial-slider">
            <div className="testimonial-track">
              {testimonials.map((img, idx) => (
                <div className="tt-testimonial-item" key={idx}>
                  <LazyLoadImage effect="blur" src={img} alt={`Testimonial ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tcp-timeline-wrapper">
        <h1 className="tcp-title">TathaGat Complete Preparation Timeline</h1>

        <p className="tcp-subtitle">Syllabus Completion – 6 Months</p>
        <p className="tcp-description">
          From the very basics to the most advanced concepts, the entire syllabus is completed within
          approximately six months from your date of enrollment.
          <br />
          Each topic is approached with conceptual depth and practical rigor to build a strong foundation.
        </p>

        {/* July – August */}
        <div className="tcp-timeline-row">
          <div className="tcp-timeline-circle">
            July
            <br />|<br />
            August
          </div>
          <div className="tcp-timeline-content">
            <h5 className="tcp-Heading">July – August: Revision & Mini Workshops</h5>
            <p className="tcp-description1">
              Once the syllabus is complete, we focus on intense revision through Mini Workshops. These are 3-4 hours’ sessions. 

            </p>
            <div className="tcp-badge-group right-align"></div>
          </div>
        </div>

        {/* September */}
        <div className="tcp-timeline-row">
          <div className="tcp-timeline-circle">Sep</div>
          <div className="tcp-timeline-content">
            <h5 className="tcp-Heading">September: Full-Length Workshops & CopyCATs</h5>
            <p className="tcp-description1">This is where the rigor begins.</p>
            <div className="tcp-badge-group tcp-right-align">
              {[
                "Write CopyCAT, CopyXAT, CopySNAP And Other Simulated Tests",
                "Attend 8-10 Hour Marathon Workshops",
                "Test Analysis",
                "Full-Length Test Strategies",
                "Time Management",
                "Mental Stamina",
                "Advanced Application Of Concepts",
              ].map((item, i) => (
                <span className="tcp-timeline-badge" key={i}>
                  ✔ {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* October – November */}
        <div className="tcp-timeline-row">
          <div className="tcp-timeline-circle">
            Oct
            <br />|<br />
            Nov
          </div>
          <div className="tcp-timeline-content">
            <h5 className="tcp-Heading">October – November: The Toppers’ Batch</h5>
            <p className="tcp-description1">Only the best make it to the Toppers’ Batch.</p>
            <div className="tcp-badge-group tcp-right-align">
              {[
                "The Top 50 Most Consistent Performers Are Selected",
                "They Receive 50–60 Extra Hours Of Practice With Mentors",
                "Focus Is On Tackling The Toughest Questions And Refining Exam Temperament",
              ].map((item, i) => (
                <span className="tcp-timeline-badge" key={i}>
                  ✔ {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* December */}
        <div className="tcp-timeline-row">
          <div className="tcp-timeline-circle">Dec</div>
          <div className="tcp-timeline-content">
            <h5 className="tcp-Heading">December: XAT & Other OMETs Preparation</h5>
            <p className="tcp-description1">With CAT done, we shift focus to XAT and other important exams.</p>
            <div className="tcp-badge-group tcp-right-align">
              {[
                "Decision Making (DM) Sessions Tailored For XAT",
                "Practice With Real Previous Year Questions (PYQs)",
                "Coverage Of Other OMETs Like: SNAP, TISSNET, MICAT And More",
              ].map((item, i) => (
                <span className="tcp-timeline-badge" key={i}>
                  ✔ {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Jan – Mar */}
        <div className="tcp-timeline-row">
          <div className="tcp-timeline-circle">
            Jan
            <br />|<br />
            Mar
          </div>
          <div className="tcp-timeline-content">
            <h5 className="tcp-Heading">January – March: GEPIWAT Training</h5>
            <p className="tcp-description1">This is your final step before success.</p>
            <div className="tcp-gep-box-group">
              <div className="tcp-gep-box">
                <div className="tcp-gep-icon">✔</div>
                <h6 className="tcp-gep-title">Prepare For:</h6>
                <ol className="tcp-gep-list">
                  <li>Group Discussions (GD)</li>
                  <li>Group Exercises (GE)</li>
                  <li>Written Ability Test (WAT)</li>
                  <li>Personal Interviews (PI)</li>
                </ol>
              </div>
              <div className="tcp-gep-box">
                <div className="tcp-gep-icon">✔</div>
                <h6 className="tcp-gep-title">Includes:</h6>
                <ol className="tcp-gep-list">
                  <li>Simulated Interview Panels</li>
                  <li>Extensive Feedback Sessions</li>
                  <li>Personalized Mentoring</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tgj-journey-wrapper">
        <div className="tgj-journey-start">
          <img src={journeyStartImg} alt="Start" />
        </div>
      </div>

      <CourseComprasion />

      <div className="tc-course-section">
        <h2 className="tc-course-title">Course Features</h2>

        <div className="tc-course-grid">
          <div className="tc-card live">
            <h4>Live classes</h4>
            <ul>
              <li>📌800 hrs of live classes</li>
              <li>📌Interactive doubt classes</li>
              <li>📌Concepts from basic to advance level</li>
              <li>📌Classes on QA, VARC, LRDI, Vocab, CA & GK</li>
            </ul>
          </div>

          <div className="tc-card app">
            {/* 2 */}
            <h4>Application classes</h4>
            <ul>
              <li>📌Application of concepts /topics</li>
              <li>📌Strengthening the concept</li>
              <li>📌Confidence builder</li>
              <li>📌Rigorous Practice</li>
            </ul>
          </div>

          <div className="tc-card workshop">
            {/* 3 */}
            <h4>Workshop</h4>
            <ul>
              <li>📌8–10 hrs sessions</li>
              <li>📌Peer to peer learning</li>
              <li>📌Time bound high level question practice</li>
              <li>📌Rigorous Practice</li>
            </ul>
          </div>

          <div className="tc-card doubt">
            {/* 4 */}
            <h4>Discussion/doubts</h4>
            <ul>
              <li>📌Topic wise discussion classes</li>
              <li>📌1 - to - 1 discussion classes</li>
              <li>📌24 x 7 doubt clearing</li>
              <li>📌Rigorous Practice</li>
            </ul>
          </div>

          <div className="tc-card reading">
          {/* 5 */}
            <h4>Reading</h4>
            <ul>
              <li>📌Book reading session</li>
              <li>📌Newspaper reading</li>
              <li>📌Curated reading list</li>
              <li>📌Familiarity with complex language</li>
            </ul>
          </div>

          <div className="tc-card flash">
            {/* 6 */}
            <h4>Flash Card</h4>
            <ul>
              <li>📌10-15 words per week</li>
              <li>📌Vocabulary builder</li>
              <li>📌Extremely high-frequency words</li>
              <li>📌Skills for RC</li>
            </ul>
          </div>

          <div className="tc-card test">
            {/* 7 */}
            <h4>Test</h4>
            <ul>
              <li>📌1000+ tests + 800 topic tests</li>
              <li>📌50 module tests + 45 sectional tests</li>
              <li>📌30 Copy CATs + 50 Mocks on OMET</li>
              <li>Weekly current affair & GK tests</li>
            </ul>
          </div>

          <div className="tc-card discipline">
            {/* 8 */}
            <h4>Discipline</h4>
            <ul>
              <li>📌Personalised attention</li>
              <li>📌Regular assignment submission</li>
              <li>📌Mandatory Book reading every week</li>
              <li>📌Attendance monitoring</li>
            </ul>
          </div>

          <div className="tc-card gdpi">
            {/* 9 */}
            <h4>GD – PI</h4>
            <ul>
              <li>📌GD classes</li>
              <li>📌Personal interviews</li>
              <li>📌Group activities</li>
              <li>📌Innovation and entrepreneurship</li>
            </ul>
          </div>

          <div className="tc-card wat">
            {/* 10 */}
            <h4>WAT</h4>
            <ul>
              <li>📌Structure of essays</li>
              <li>📌Working with timelines</li>
              <li>📌Creativity</li>
              <li>📌Most frequently asked topics</li>
            </ul>
          </div>

          <div className="tc-card recordings">
            {/* 11 */}
            <h4>Recordings</h4>
            <ul>
              <li>📌Handy recordings of entire course</li>
              <li>📌Unlimited views</li>
              <li>📌Revision</li>
              <li>📌Structured viewing</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="philosophy-wrapper">
        <div className="philosphy-mainHeader">
          <div>
            <h4 className="philosophy-subtitle">Why Choose Us</h4>
            <h1 className="philosophy-heading">
              How TathaGat Can Benefit <br />
              you for IPMAT Prep
            </h1>
          </div>
          <div>
            <p className="philosophy-text">
              Tathagat offers expert faculty, personalized mentoring, structured content, and real-exam level
              mocks — all designed to help serious aspirants crack CAT, GMAT, IPMAT, and more with confidence.
            </p>
            <button className="learn-btn">Learn More</button>
          </div>
        </div>
        <div className="philosophy-cards">
          {cards.map((card, index) => (
            <div className="philosophy-card" key={index} style={{ backgroundColor: card.bgColor }}>
              <div className="philosophy-uppr-card">
                <div className="philosophy-arrow-tab">{card.number}</div>
                <h3 className="philosophy-card-title">{card.title}</h3>
              </div>

              <p className="philosophy-card-desc">{card.description}</p>
              <LazyLoadImage src={card.image} alt="Card Visual" className="philosophy-card-img" />
            </div>
          ))}
        </div>
      </div>

      <div className="txt-gallery-wrapper">
        <div className="txt-gallery-header">
          <h2 className="txt-gallery-title">What Students Say About Us</h2>
          <button className="txt-gallery-view-all" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : "View All"}
          </button>
        </div>

        <div className="txt-gallery-grid">
          {(showAll ? galleryImages : galleryImages.slice(0, 8)).map((img, i) => (
            <div key={i} className="txt-gallery-card">
              <img src={img} alt={`gallery-${i}`} className="txt-gallery-img" />
            </div>
          ))}
        </div>
      </div>

      <div className="tt-convo-wrapper">
        <div className="tt-convo-headings">
          <h2>Conversations That Count</h2>
          <p className="tt-convo-sub">Success Stories That Inspire</p>
          <p className="tt-convo-desc">
            See how determined students, guided by expert mentors at TathaGat, transformed challenges
            <br />
            into top scores and B-school admits.
          </p>
        </div>

        <div className="tt-convo-content">
          {/* LEFT: Reviews (scrollable) */}
          <div className="tt-reviews-section">
            <div className="tt-reviews-scroll">
              <img src={revieww2} alt="Review 1" className="tt-review-img" />
              <img src={revieww3} alt="Review 2" className="tt-review-img" />
              <img src={revieww4} alt="Review 3" className="tt-review-img" />
            </div>
          </div>

          {/* RIGHT: Videos */}
          <div className="tt-videos-section">
            <div className="tt-video-header">
              <div className="tt-video-heading">
                <h4>Hear It from Our Achievers</h4>
                <p>Real Stories. Real Results. Real Confidence.</p>
              </div>
              <button className="tt-view-all">View all videos</button>
            </div>

            <div className="tt-video-row">
              <div className="tt-video-card">
                <iframe
                  width="100%"
                  height="200"
                  src="https://www.youtube.com/embed/EHBQ3AJ-uEo"
                  title="Video 1"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="tt-video-card">
                <iframe
                  width="100%"
                  height="200"
                  src="https://www.youtube.com/embed/IVnBi5uPHW0"
                  title="Video 2"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="demo-title">Real classroom energy. Real concept clarity.</h2>
        <p className="demo-subtext">
          Before you join us, see how we teach. Watch demo clips from our top faculty as they break down
          concepts, share strategies, and make learning engaging and effective.
        </p>

        <div className="demo-buttonss">
          <button className={activeCategory === "All" ? "active" : ""} onClick={() => setActiveCategory("All")}>
            All Category
          </button>
          <button
            className={activeCategory === "QUANT" ? "active" : ""}
            onClick={() => setActiveCategory("QUANT")}
          >
            QUANT
          </button>
          <button className={activeCategory === "VARC" ? "active" : ""} onClick={() => setActiveCategory("VARC")}>
            VARC
          </button>
          <button className={activeCategory === "LRDI" ? "active" : ""} onClick={() => setActiveCategory("LRDI")}>
            LRDI
          </button>
        </div>

        <div className="video-scroll">
          {visibleVideos.map((video, index) => {
            const id = video.link.split("v=")[1] || video.link.split("/").pop();
            return (
              <div className="video-card" key={index}>
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title={`Video ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="video-info">
                  <span className="video-label">Watch Video</span>
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-author">{video.author}</p>
                  <p className="video-cta">Watch Now →</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ExploreBlog />
    </div>
  );
};

export default CourseDetails;
