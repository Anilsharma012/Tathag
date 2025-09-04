import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./WhySection.css";
import doubt from "../../images/doubt.png";
import topicWise from "../../images/topicWiseAnalysis.png";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import image8 from "../../images/image 8.png";
import reviewLast from "../../images/rerviewLast.png";
import studentsGroup from "../../images/gourp 1.png";
import youtube from "../../images/youtube.png";

import review1 from "../../images/Review/1.PNG";
import review2 from "../../images/Review/2.PNG";
import review3 from "../../images/Review/3.PNG";
import review4 from "../../images/Review/4.PNG";
import review5 from "../../images/Review/5.PNG";

const cardDetails = [
  {
    title: "Concept and Practice",
    desc:
      "At TathaGat, we ensure that students first master concepts before applying them to real CAT, XAT, GMAT, and SNAP questions. This dual-method approach makes them highly prepared for exams.",
    type: "accordion",
    accordionList: [
      "Concept Class",
      "Question Solving",
      "Practice Session",
      "Doubts And Discussion",
      "Test",
      "Strategy Sessions",
      "Workshop",
    ],
    styleClass: "card-style-1",
  },
  {
    title: "Important Note",
    desc:
      "TathaGat was established in 2007 by Rajat and Kumar with a vision to revolutionize MBA entrance exam preparation. With a student-first approach, TathaGat focuses on concept clarity, rigorous practice, and personalized mentoring to help aspirants achieve 99+ percentiles. Over the years, it has built a reputation for innovative pedagogy, expert faculty, and exceptional success rates, making it the most trusted name in MBA coaching.",
    styleClass: "card-style-2",
    type: "aboutUs",
    buttonText: "About Us",
  },
  {
    title: "Doubt Sessions",
    desc:
      "TathaGat offers Unlimited 1-to-1 Doubt Sessions, Round-the-Clock Assistance, and Live Class Doubts resolution, ensuring every student gets instant support, personalized guidance, and real-time clarity to strengthen their understanding and boost confidence.",
    type: "review",
    reviewImg: doubt,
    badge: "3",
    styleClass: "card-style-3",
  },
  {
    title: "24*7 Support",
    desc:
      "TathaGat offers unlimited one-on-one doubt sessions, live class doubt resolution, and round-the-clock assistance, ensuring no query goes unanswered. Expert mentors provide continuous support, boosting confidence and enhancing problem-solving skills for exams.",
    type: "button",
    buttonText: "Call Now",
    styleClass: "card-style-4",
  },
  {
    title: "Workshops",
    desc:
      "TathaGat's 8–10 hour workshops, pioneered in 2007, tackle challenging CAT/XAT/SNAP/GMAT questions, giving students a competitive edge and eliminating exam fear through rigorous practice on past exam questions.",
    type: "textButton",
    buttonText: "View More",
    styleClass: "card-style-5",
  },
  {
    title: "Recorded Live Lectures",
    desc:
      "TathaGat provides recorded lectures for the entire course, allowing students unlimited access for revision. They can fatch these recordings anytime, as many times as needed, ensuring complete concept clarity.",
    styleClass: "card-style-6",
  },
  {
    title: "Topic Wise Analysis",
    desc:
      "TathaGat provides detailed topic-wise analysis for every test, helping students identify strengths and weaknesses.",
    img: topicWise,
    buttonText: "Expand ",
    styleClass: "card-style-7",
  },
  {
    title: "Tests",
    desc:
      "TathaGat offers 1,000+ AI-based tests, including PCTs, Topic Tests, Sectional, Full-Length, and CopyCATs. These tests provide detailed performance analysis, helping students track mistakes, growth patterns, strengths, and weaknesses, ensuring optimized strategies for CAT, XAT, NMAT, SNAP, and other exams.",
    styleClass: "card-style-8",
  },
  {
    title: "FREE YouTube Lectures",
    desc:
      "TathaGat offers extensive free YouTube lectures for CAT and OMETs, covering FAQs, exam updates, and PYQ analyses. These lectures help students revise, practice, and stay updated. Alongside recorded course lectures, they provide accessible, high-quality learning anytime, ensuring students are always prepared.",
    buttonText: "Watch Now",
    styleClass: "card-style-9",
  },
  {
    title: "CAT Aspirant’s Reviews",
    desc: "",
    img: reviewLast,
    buttonText: "View More",
    styleClass: "card-style-10",
  },
];

const splitCardsInTwo = (cards) => {
  const mid = Math.ceil(cards.length / 2);
  return [cards.slice(0, mid), cards.slice(mid)];
};

const WhySection = () => {
  const [leftCards, rightCards] = splitCardsInTwo(cardDetails);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", desc: "" });
  const navigate = useNavigate();

  const openModal = (title, desc) => {
    setModalContent({ title, desc });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <section className="wt-section">
        <div className="wt-bg-text">THE COACHING INSTITUTE</div>
        <div className="wt-final-layout">
          {/* Left Static Side */}
          <div className="wt-left-static">
            <p className="wt-label">WHY TATHAGAT?</p>
            <h2 className="wt-heading">Because We Make Success Inevitable!</h2>
            <p className="wt-subtext">
              TathaGat is committed to your success in competitive exams,
              whether it's CAT, XAT, SNAP, GMAT, or CUET. Our unique teaching
              methodology ensures that students grasp concepts from the ground
              up, with a focus on application-based learning. We offer
              personalized mentorship, small batch sizes, and AI-driven
              analytics to help students track their progress effectively. Our
              approach is not just about teaching; it’s about building
              confidence, sharpening problem-solving skills, and refining
              test-taking strategies to maximize scores.
            </p>
            <img src={image8} alt="India Today Logo" className="wt-logo" />
            <img src={studentsGroup} alt="Student Group" className="wt-student-img" />
          </div>

          {/* Right Scroll Area */}
          <div className="wt-right-scroll">
            {/* Left Column */}
            <div className="wt-scroll-column">
              <div className="wt-scroll-wrapper">
                {leftCards.map((card, index) => (
                  <div className={`wt-header-card ${card.styleClass}`} key={index}>
                     <div className="card-title-with-badge">
                    {card.title && <h3 className="wt-card-title">{card.title}</h3>}
                       {card.badge && <span className="red-badge">{card.badge}</span>}
                                               </div>
                    {card.desc && <p className="wt-card-desc">{card.desc}</p>}

                    {/* Accordion */}
                    {card.type === "accordion" && (
                      <>
                        <div className="card-accordion">
                          {card.accordionList?.map((item, i) => (
                            <div className="accordion-item" key={i}>
                              <div className="accordion-title">
                                {item}
                                <span className="arrow">▼</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="view-more-btn">
                          View More <span className="arrow-box">↗</span>
                        </button>
                      </>
                    )}

                    {/* Important Note */}
                    {card.title === "Important Note" && (
                      <div style={{ textAlign: "left", marginTop: "10px" }}>
                        <button className="about-btn">{card.buttonText}</button>
                      </div>
                    )}

                    {/* 24*7 Support */}
                    {card.title === "24*7 Support" && (
                      <div style={{ textAlign: "left", marginTop: "10px" }}>
                        <button
                          className="call-now-btn"
                          onClick={() => navigate("/GetInTouch")}
                        >
                          Call Now <span className="phone-icon">📞</span>
                        </button>
                      </div>
                    )}

                    {/* Workshops */}
                    {card.title === "Workshops" && (
                      <div style={{ textAlign: "left", marginTop: "10px" }}>
                        <button className="view-more-btn">
                          View More <span className="arrow-box">↗</span>
                        </button>
                      </div>
                    )}

                    {/* ✅ Doubt Sessions (LEFT COLUMN) */}
                    {card.title === "Doubt Sessions" && (
                      <>
                       
                        <h4 className="review-subheading">
                          Listen From Our Students About The Doubt Sessions
                        </h4>
                         <div className="card-title-with-badge">
                          <h3 className="wt-card-title">{card.title}</h3>
                          {/* {card.badge && <span className="red-badge">{card.badge}</span>} */}
                        </div>
                        {card.reviewImg && (
                          <img src={card.reviewImg} alt="Review" className="full-review-img" />
                        )}
                        <button
                          className="view-more-btn"
                          onClick={() => openModal(card.title, card.desc)}
                        >
                          View More <span className="arrow-box">↗</span>
                        </button>
                      </>
                    )}

                    {/* Topic Wise Analysis quick CTA on left (optional) */}
                    {card.title === "Topic Wise Analysis" && (
                      <div style={{ textAlign: "left", marginTop: "10px" }}>
                        <button className="call-now-btn">
                          Call Now <span className="phone-icon">📞</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="wt-scroll-column">
              <div className="wt-scroll-wrapper">
                {rightCards.map((card, index) =>
                  card.title !== "Important Note" ? (
                    <div className={`wt-header-card ${card.styleClass}`} key={index}>
                      {card.title && <h3 className="wt-card-title">{card.title}</h3>}
                      {card.desc && <p className="wt-card-desc">{card.desc}</p>}
                      {card.img && (
                        <img src={card.img} alt={card.title} className="wt-card-img" />
                      )}

                      {card.title === "Tests" && (
                        <div style={{ textAlign: "left", marginTop: "10px" }}>
                          <button className="view-more-btn">View More</button>
                        </div>
                      )}

                      {card.title === "FREE YouTube Lectures" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "10px",
                          }}
                        >
                          <button className="view-more-btn">Watch Now</button>
                          <img src={youtube} alt="YouTube Icon" className="youtube" />
                        </div>
                      )}

                      {card.title === "Recorded Live Lectures" && (
                        <div style={{ textAlign: "left", marginTop: "10px" }}>
                          <button className="view-more-btn">
                            View More <span className="arrow-box">↗</span>
                          </button>
                        </div>
                      )}

                      {/* (Right column me bhi agar kabhi Doubt Sessions chala jaye future me, safe) */}
                      {card.title === "Doubt Sessions" && (
                        
                        <>
                           {card.badge && <span className="red-badge">{card.badge}</span>}
                          <div className="card-title-with-badge">
                            <h3 className="wt-card-title">{card.title}</h3>
                         
                          </div>
                          <h4 className="review-subheading">
                            Listen From Our Students About The Doubt Sessions
                          </h4>
                          {card.reviewImg && (
                            <img src={card.reviewImg} alt="Review" className="full-review-img" />
                          )}
                          <button
                            className="view-more-btn"
                            onClick={() => openModal(card.title, card.desc)}
                          >
                            View More <span className="arrow-box">↗</span>
                          </button>
                        </>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SINGLE MODAL rendered once (outside both maps) */}
        {isModalOpen && (
          <div className="tg-modal-overlay" onClick={closeModal}>
            <div className="tg-modal" onClick={(e) => e.stopPropagation()}>
              <span className="tg-close" onClick={closeModal}>
                &times;
              </span>
              <h2 style={{ color: "black" }}>{modalContent.title}</h2>
              <p style={{ color: "black" }}>{modalContent.desc}</p>
              <div className="tg-reviews-img">
                <img src={review1} alt="Review 1" />
                <img src={review2} alt="Review 2" />
                <img src={review3} alt="Review 3" />
                <img src={review4} alt="Review 4" />
                <img src={review5} alt="Review 5" />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default WhySection;
