import React, { useState } from "react";
import "./ourBlog.css";
import ourBlogTwo from "../../images/ourBlogTwo.png";
import ourBlogThree from "../../images/ourBlogThree.png";
import ourTeam from "../../images/contactTeams.png";
import LazyImage from "../../components/LazyImage/LazyImage";
import FAQ from "../../components/FAQ/FAQ";
import { FaSearch, FaRegCalendarAlt } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import blogImg1 from "../../images/BLOG.webp";
import blogImg2 from "../../images/BLOG1.webp";
import blogImg3 from "../../images/BLOG2.webp";
import blogImg4 from "../../images/BLOG3.webp";
import blogImg5 from "../../images/BLOG4.webp";
import blogImg6 from "../../images/BLOG5.webp";
import blogImg7 from "../../images/BLOG6.webp";
import blogImg8 from "../../images/BLOG7.webp";
import blogImg9 from "../../images/BLOG8.webp";
import blogImg10 from "../../images/BLOG9.webp";
import blogImg11 from "../../images/BLOG10.webp";
import blogImg12 from "../../images/BLOG11.webp";

// ✅ Define blogTitles BEFORE blogData
const blogTitles = [
  "Top influential entrepreneurs in India from IIM",
  "IPMAT/JIPMAT Study Material 2024",
  "Common Errors in Verb-Tense to avoid: CAT (VARC)",
  "Levels of Reading Comprehension: CAT Preparation tips 2024",
  "Tips to solve Alphanumeric series: CAT Logical Reasoning",
  "How to use Calculator in CAT Exam 2024",
  "Exam day tips for CAT",
  "Project Scope Management: Why is it important?",
  "Importance of Vedic Maths in CAT",
  "Is coaching necessary for CUET Preparation?",
  "Analogy Reasoning: Understanding Analogy Reasoning",
  "Benefits of opting Integrated Program"
];

const blogImages = [
  blogImg1, blogImg2, blogImg3, blogImg4, blogImg5, blogImg6,
  blogImg7, blogImg8, blogImg9, blogImg10, blogImg11, blogImg12
];

// ✅ Now generate blogData using blogTitles
const blogData = blogImages.map((img, i) => ({
  id: i + 1,
  title: blogTitles[i],
  date: "Feb 24, 2025",
  image: img,
}));

const teamImages = [ourTeam, ourTeam, ourTeam];

const categories = [
  "All", "Top Blogs", "Topper's Journey", "MBA",
  "CAT", "IPMAT", "CUET", "Info Exam","B-Schools"
];                                                                                                                                                                                                                                                                                                                                                                                                

const OurBlogs = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // const next = () => setIndex((index + 1) % teamImages.length);
  // const prev = () => setIndex((index - 1 + teamImages.length) % teamImages.length);

  return (
    <div>
      {/* Hero Section */}
      <section className="our-blog-section">
        <div className="overlay"></div>
        <div className="blog-contenting">
          <h1>Dive Deeper Into TathaGat</h1>
          <p>
            Stay updated with powerful tips, real stories, and expert advice on
            preparation, motivation and results. Explore articles designed to help
            you grow, and achieve.
          </p>
          <button className="enquire-btn" onClick={() => navigate('/AboutUs')}>Know About Us</button>
        </div>
      </section>

      {/* Category + Search */}
      <div className="blog-filter-container">
        <div className="category-buttons">
          {categories.map((cat, i) => (
            <button key={i} className={`chip ${i === 0 ? "active" : ""}`}>{cat}</button>
          ))}
        </div>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search" />
        </div>
      </div>

      {/* Featured Blog */}
      <section className="latest-post-wrapper">
        <h2 className="latest-title">Latest Posts</h2>

        <div className="latest-card">
          <LazyImage src={ourBlogTwo} alt="Blog Cover" className="post-image" />

          <div className="post-details">
            <h3 className="post-title">
              Top 5 Time Management Tips for CAT Aspirants
            </h3>
            <p className="post-desc">
              Managing time during preparation — and the exam itself — can make
              or break your score. Here are five tested techniques from toppers.
              The CAT exam isn’t merely a test of knowledge; it’s a test of
              speed, precision, and decision-making under pressure.
            </p>

            <div className="post-footer">
              <div className="author">
                <LazyImage src={ourBlogThree} alt="TG" className="author-logo" />
                <div>
                  <p className="author-name">By Tathagat Faculty</p>
                  <p className="author-date">Published: April 10, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Blogs */}
      <div className="blog-grid-wrapper">
        <div className="blog-grid-container">
          {blogData.map((blog) => (
            <div className="tb-blog-card" key={blog.id}>
              <LazyImage src={blog.image} alt={blog.title} onClick={() => navigate("/ourBlog")} />
              <div className="card-footer">
                <span className="date">
                  <FaRegCalendarAlt className="icon" />
                  {blog.date}
                </span>
                <h4 className="title">{blog.title}</h4>
                <div className="arrow">
                  <FiArrowUpRight />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="ts-blog-team-wrapper">
        <div className="ts-blog-team-left">
          <h2 className="ts-blog-team-heading">
            Don't Just Dream It. Crack It <br />
            with TathaGat!
          </h2>
          <button className="ts-blog-contact-btn" onClick={() => navigate("/GetInTouch")}>Contact Now</button>
        </div>

        <div className="ts-blog-team-right">
          <div className="ts-blog-team-header">
            <span style={{ fontSize: "24px", fontWeight: "700", color: "black" }}>
              Meet the team
            </span>
            <button onClick={() => navigate("/team")} className="ts-blog-view-all-btn">View all</button>
          </div>

          <div className="ts-blog-team-box">
            {/* <button onClick={prev} className="ts-blog-arrow left">←</button> */}
            <LazyImage src={teamImages[index]} alt="Team" className="ts-blog-team-image" />
            {/* <button onClick={next} className="ts-blog-arrow right">→</button> */}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};

export default OurBlogs;
