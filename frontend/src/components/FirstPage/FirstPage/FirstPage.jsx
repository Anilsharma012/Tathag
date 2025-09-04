import React, { useState, useEffect, useRef, useMemo } from "react";
import "./FirstPage.css";
import { FaStar, FaArrowLeft, FaArrowRight, FaThLarge } from "react-icons/fa";
import LazyImage from "../../LazyImage/LazyImage";

import reviewfirst from "../../../images/Review/gitika.jpeg";
import reviewsecond from "../../../images/Review/KUSH.jpeg";
import reviewthird from "../../../images/Review/jatin.jpeg";
import reviewfour from "../../../images/Review/dristhi.jpeg";



const slides = [
  {
    icon: "📈",
    text: "Mastering Concepts From Basic To Advanced Levels",
  },
  {
    icon: "🎧",
    text: "Unlimited 1-To-1 Doubt Sessions & 24x7 Assistance",
  },
  {
    icon: "⏰",
    text: "Renowned 8-10 Hour Rigorous Workshops",
  },
];

const testimonials = [
  {
    name: "GITIKA",
    college: "IIM Kozhikode",
    text: "TG's commitment to maximize a student's CAT scorecard is unprecedented. The focus on all the sections- Quant, Verbal, DILR and GK ensures that the student is prepared in an all-rounded manner. ",
    image: reviewfirst,
  },
  {
    name: "KUSH SAXENA",
    college: "FMS",
    text: "There are simply no words to describe the learning and experience that i had in Tathagat, the fact that it is being spearheaded by the best teacher of India (Kumar Sir) is itself a testimonial for this.",
    image: reviewsecond,
  },
  {
    name: "JATIN TUTEJA",
    college: "IIM-Calcutta",
    text: "The rotation of faculties gives students a taste of the experience of studying under various teachers and ensures that all the batches are treated equally.",
    image: reviewthird,
  },
    {
    name: "Drishti Agrawal",
    college: "IIFT",
    text: "The classroom environment created by the teachers kept me motivated throughout. Something that sets TG apart from other coaching institutes in my opinion is that it helps us look at the bigger picture which ultimately helps ",
    image: reviewfour,
  },
];

export default function FirstPage() {
  const [current, setCurrent] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const handlePrev = () => {
    setTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="firstpage-hero-container">
      <div className="firstpage-hero-content">
        {/* Left Side */}
        <div className="firstpage-hero-left">
          <p className="firstpage-hero-tagline">DREAM BIG. PREPARE SMART. ACHIEVE MORE.</p>
          <h1 className="firstpage-hero-heading">
            Start Your Journey<br />
            Towards a <span className="highlight">99%ile!</span>
          </h1>
        </div>

        {/* Right Side */}
        <div className="firstpage-hero-right">
          {/* Carousel Card */}
          <div className="firstpage-hero-card">
            <span className="firstpage-badge">Since 2007</span>
            <div className="firstpage-hero-icon">{slides[current].icon}</div>
            <p className="firstpage-card-text">{slides[current].text}</p>
            <div className="firstpage-dots">
              {slides.map((_, idx) => (
                <span key={idx} className={idx === current ? "active" : ""}></span>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="firstpage-testimonial-box">
           
            <div className="firstpage-testimonial-header">
              <LazyImage
                src={testimonials[testimonialIndex].image}
                alt={testimonials[testimonialIndex].name}
                className="firstpage-avatar"
              />
              <div>
                <strong style={{ color: "black" }}>{testimonials[testimonialIndex].name}</strong>
                <p style={{ color: "black" }}>{testimonials[testimonialIndex].college}</p>
              </div>
              <div className="firstpage-rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} color="#fbbf24" />
                ))}
              </div>
            </div>
            <p className="firstpage-testimonial-text">
              <strong>TathaGat</strong> {testimonials[testimonialIndex].text}
            </p>
            <div className="firstpage-testimonial-footer">
           
              <a href="#" className="story-link">1700+ Success Stories →</a>
              <div className="firstpage-arrows">
                <FaArrowLeft onClick={handlePrev} className="arrow" />
                <FaArrowRight onClick={handleNext} className="arrow" />
                <FaThLarge />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
