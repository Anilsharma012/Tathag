import React, { useState } from 'react';
import './Faq.css';
import faqImage from "../../images/faqOne.png"
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    question: "What courses does TathaGat offer?",
    answer:
      "We offer preparation courses for CAT, XAT, SNAP, GMAT, CUET, and other management entrance exams. Our programs include concept classes, question-solving sessions, workshops, strategy sessions, and extensive doubt discussions.",
  },
  {
    question: "What makes TathaGat different from other coaching institutes?",
    answer: "Our personalized mentorship, small batch sizes, and AI-driven analytics set us apart.",
  },
  {
    question: "How can I track my progress at TathaGat?",
    answer: "We provide performance tracking tools, mock tests, and analytics to help you track your progress.",
  },
  {
    question: "Does TathaGat offer online classes?",
    answer: "Yes, we offer both online and offline classes with the same rigor and effectiveness.",
  },
  {
    question: "How do I enroll at TathaGat?",
    answer: "Visit our website or contact our counsellors for enrollment assistance.",
  },
  {
    question: "Can I access recorded lectures of live classes?",
    answer: "Yes, recorded lectures are provided to help you revise and catch up.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);
   const [activeTab, setActiveTab] = useState("All Category");

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
   const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

   const tabs = [
    "All Category",
    "Course & Curriculum",
    "Tests & Practice",
    "Mentoring & Support",
    "Enrollment & Payment",
  ];
const navigate=useNavigate()
  return (
    <>
      <div className="tf-faq-wrapper">
      <h2 className="tf-faq-title">Got Questions ?<br />We’ve Got Answers!</h2>
      <p className="tf-faq-subtitle">Everything You Need to Know Before You Begin Your Journey with TathaGat</p>

      {/* 🔵 Tabs */}
      <div className="tf-faq-tabs">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`tf-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🔵 FAQ List */}
      <div className="tf-faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="tf-faq-item">
            <div className="tf-faq-questions" onClick={() => toggleAnswer(index)}>
              <span>{index + 1}. {faq.question}</span>
              <span className="tf-faq-icon">{openIndex === index ? '−' : '+'}</span>
            </div>
            {openIndex === index && (
              <div className="tf-faq-answer">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>



<div className="tf-trust-section">
      <div className="tf-trust-left">
        <h2 className="tf-trust-title">India’s Most Trusted Coaching Institute</h2>
        <p className="tf-trust-tagline">
          At TathaGat, trust is not a claim — it’s a commitment we’ve earned through unwavering integrity, consistent results, and student-first mentorship.
        </p>
        <p className="tf-trust-description">
          For over a decade, TathaGat has been the go-to institute for aspirants targeting CAT, XAT, SNAP, IIFT, TISSNET, and other top MBA entrances. With a unique blend of conceptual clarity, expert mentorship, and personalized attention, we’ve helped thousands of students secure calls and final admits from the IIMs, XLRI, and India’s elite B-schools.
        </p>
        <button className="tf-trust-button" onClick={()=>navigate("/Testimonial")}>See Our Achievement</button>
      </div>

      <div className="tf-trust-right">
        <div className="tf-trust-card">
          <h1 className="tf-stat-value">10,000+</h1>
          <h3 className="tf-stat-title">Students Trained Across India</h3>
          <p className="tf-stat-description">
            Over the years, we’ve mentored thousands of aspirants from all walks of life — from fresh graduates to working professionals — guiding them toward their MBA dreams.
          </p>
        </div>
        <div className="tf-trust-card">
          <h1 className="tf-stat-value">1000+</h1>
          <h3 className="tf-stat-title">IIM Calls Every Year</h3>
          <p className="tf-stat-description">
            Our students consistently receive over a thousand calls annually from various IIMs, thanks to our structured preparation, mocks, and strategy sessions.
          </p>
        </div>
      </div>
    </div>






     <div className="tf-section-wrapper">
      {/* Left: Form */}
      <div className="tf-form-box">
  <h2 className="tf-form-title">Still have a question?</h2>
  <form className="tf-form">
    <input
      type="text"
      placeholder="Your Name"
      className="tf-input"
      required
    />
    <input
      type="email"
      placeholder="Email Address"
      className="tf-input"
      required
    />
    <textarea
      placeholder="Type your question here..."
      className="tf-textarea"
      required
    />
    <button
      type="submit"
      onClick={() => alert("Your question has been submitted!")}
      className="tf-submit-btn"
    >
      Submit Your Question
    </button>
  </form>
</div>


      {/* Right: Telegram Box */}
      <div className="tf-telegram-box" style={{ backgroundImage: `url(${faqImage})` }}>
        <div className="tf-telegram-overlay">
          <h3 className="tf-telegram-text">Join our Free Telegram<br />Discussion Group!</h3>
          <button className="tf-telegram-btn">Join now</button>
        </div>
      </div>
    </div>






    <section className="tf-faq-section">
  <div className="tf-faq-left">
    <h5>GENERAL FAQS</h5>
    <h2>Your Questions,</h2>
    <h2>Answered Clearly and</h2>
    <h2>Concisely</h2>
    <p>
      Find answers to common queries about TathaGat’s courses, teaching methods, tests,
      workshops, mentorship, fees, and more in our FAQs.
    </p>
    <button>Ask your question here</button>
  </div>

  <div className="tf-faq-right">
    {faqs.map((faq, index) => (
      <div
        key={index}
        className={`tf-faq-item ${openIndex === index ? 'open' : ''}`}
        onClick={() => toggleIndex(index)}
      >
        <div className="tf-faq-question">
          <span>{index + 1}. {faq.question}</span>
          <span className="tf-faq-toggle">{openIndex === index ? '−' : '+'}</span>
        </div>
        {openIndex === index && <p className="tf-faq-answer">{faq.answer}</p>}
      </div>
    ))}
  </div>
</section>

    </>


  );
};

export default Faq;