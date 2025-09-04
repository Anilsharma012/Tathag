// import React from 'react'
import "./OurFaculity.css"
import { FaArrowLeft, FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import footerOne from "../../images/footer1.png";
import footerTwo from "../../images/footer2.png";
import footerThree from "../../images/footer3.png";
import footerFour from "../../images/footer4.png";

import '@fortawesome/fontawesome-free/css/all.min.css';
import one from "../../images/ourfaculityOne.png";
import two from "../../images/ourfaculityTwo.png";
import three from "../../images/ourfaculityThree.png"

import RAJAT from "../../images/Rajat.png"
import KUMAR from "../../images/KumarSir.png"
import NIRAJ from "../../images/Niraj-Sir.png"
import KISHAN from "../../images/Kishan.png"
import LYDIA from "../../images/Lydia.png"
import AZHAR from "../../images/Azhar.png"
import SNEHA  from "../../images/Sneha-Malik.png"
import SANDEEP from "../../images/Sandeep.png"

import img1 from "../../images/aa.PNG";
import img2 from "../../images/ab.PNG";
import img3 from "../../images/ac.PNG";
import img4 from "../../images/ad.PNG";
import img5 from "../../images/ae.PNG";
import img6 from "../../images/af.PNG";
import img7 from "../../images/ag.PNG";
import img8 from "../../images/ah.PNG";
import img9 from "../../images/ai.PNG";
import img10 from "../../images/aj.PNG";

const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];




const blogData = [
  {
    id: 1,
    image: footerOne,
    date: "Feb 24, 2025",
    title: "Books for CUET Preparation UG 2024",
  },
  {
    id: 2,
    image: footerTwo,
    date: "Feb 24, 2025",
    title: "Books for CUET Preparation UG 2024",
  },
  {
    id: 3,
    image: footerThree,
    date: "Feb 24, 2025",
    title: "Books for CUET Preparation UG 2024",
  },
  {
    id: 4,
    image: footerFour,
    date: "Feb 24, 2025",
    title: "Books for CUET Preparation UG 2024",
  },
];


















const facultyData = [
    {
      name: "RAJAT TATHAGAT",
      role: "CEO & Founder",
      tag: "IIT Alumnus",
      image: RAJAT,
      social: {
        facebook: "#",
        instagram: "#",
        telegram: "#",
      },
    },
    {
      name: "KUMAR ABHISHEK",
      role: "CMO & Co-Founder",
      tag: "IIT Alumnus",
      image: KUMAR,
      social: {
        facebook: "#",
        instagram: "#",
        telegram: "#",
      },
    },
    {
      name: "NIRAJ NAIYAR",
      role: "COO",
      tag: "IIT Alumnus",
      image:NIRAJ,
      social: {
        facebook: "#",
        instagram: "#",
        telegram: "#",
      },
    },
    {
      name: "KISHAN BHARDWAJ",
      role: "COO",
      tag: "IIT Alumnus",
      image:KISHAN,
      social: {
        facebook: "#",
        instagram: "#",
        telegram: "#",
      },
    },
    {
        name: "SNEHA MALIK",
        role: "",
        tag: "IIT Alumnus",
        image:SNEHA,
        social: {
          facebook: "#",
          instagram: "#",
          telegram: "#",
        },
      },
      {
        name: "SANDEEP",
        role: "",
        tag: "IIT Alumnus",
        image:SANDEEP,
        social: {
          facebook: "#",
          instagram: "#",
          telegram: "#",
        },
      },
    {
      name: "LYDIA",
      role: "",
      tag: "IIT Alumnus",
      image: LYDIA,
      social: {
        facebook: "#",
        instagram: "#",
        telegram: "#",
      },
    },
    {
      name: "AZHAR",
      role: "",
      tag: "IIT Alumnus",
      image: AZHAR,
      social: {
        facebook: "#",
        instagram: "#",
        telegram: "#",
      },
    },
  ];
  


const OurFaculity = () => {
  return (
    <div>
      
      <div className="tg-faculty-section">
      <h2 className="tg-subtitle">Meet</h2>
      <h1 className="tg-titles">OUR FACULTIES</h1>
      <p className="tg-description">
        Get ready to meet our passionate team of mentors and educators—all under
        one roof at our dedicated center in Delhi. At TathaGat, we believe in
        quality over quantity, and our single-branch focus ensures every student
        gets the attention they truly deserve.
      </p>
      <div className="tg-faculty-gallery">
        <img src={one} alt="Faculty 1" />
        <img src={two} alt="Faculty 2" />
        <img src={three} alt="Faculty 3" />
      </div>
    </div>





    <div className="tg-faculty-grid">
      {facultyData.map((faculty, index) => (
        <div className="tg-faculty-row" key={index}>
          <div className="tg-faculty-img">
            <img src={faculty.image} alt={faculty.name} />
          </div>
          <div className="tg-faculty-text">
            <p className="tg-role">{faculty.role}</p>
            <p className="tg-tag">{faculty.tag}</p>
            <h3 className="tg-name">{faculty.name}</h3>
            <div className="tg-social-icons">
              <a href={faculty.social.facebook}><i className="fab fa-facebook"></i></a>
              <a href={faculty.social.instagram}><i className="fab fa-instagram"></i></a>
              <a href={faculty.social.telegram}><i className="fab fa-telegram"></i></a>
            </div>
          </div>
        </div>
      ))}
    </div>




    <div>
      {/* Top Heading Section */}
      <div className="tg-faculty-section">
        <h2 className="tg-subtitle">TESTIMONIALS</h2>
        <h1 className="tg-titling">Hear From Our Achievers</h1>
        <p className="tg-description">
          At TathaGat, we pride ourselves on our students’ success. Here’s what some of our top performers have to say about their journey with us:
        </p>
      </div>

      {/* Testimonial Images Grid */}
      <div className="testimonial-grid">
        {images.map((src, idx) => (
          <div className="testimonial-card" key={idx}>
            <img src={src} alt={`testimonial-${idx}`} className="testimonial-image" />
          </div>
        ))}
      </div>
    </div>




     <section className="blog-slider-wrapper">
            <div className="blog-header">
              <div>
                <p className="headerBlog">Explore our blog</p>
                <h2>
                  Unlock Success Through <br /> Knowledge
                </h2>
              </div>
              <div>
                <p>
                  Stay informed with the latest articles, tips, and strategies from
                  TathaGat. From exam preparation guides to success stories, our
                  blog covers everything you need to excel in CAT, XAT, SNAP, GMAT,
                  CUET, and more.
                </p>
              </div>
            </div>
    
            <div className="blog-filter-buttons">
              {[
                "All",
                "Top Blogs",
                "Topper Journeys",
                "MBA",
                "IIT JEE",
                "NEET",
                "Study Aboard",
                "After 12th",
              ].map((tag, idx) => (
                <button key={idx}>{tag}</button>
              ))}
            </div>
    
            <div className="blog-cards-container">
              {blogData.map((blog) => (
                <div key={blog.id} className="blog-card">
                  <img
                    src={blog.image}
                    alt="blog thumbnail"
                    className="blog-image"
                  />
                  <div className="blog-info">
                    <span className="blog-date">
                      <FaCalendarAlt /> {blog.date}
                    </span>
                    <h4>{blog.title}</h4>
                  </div>
                </div>
              ))}
            </div>
            <div className="Blog-Footer-Main">
              <div className="blog-footer">
                <button className="arrow-button">
                  <FaArrowLeft />
                </button>
                <div className="slider-indicator" />
                <button className="arrow-button">
                  <FaArrowRight />
                </button>
              </div>
    
              <div className="view-all-button">
                <button>View all</button>
              </div>
            </div>
          </section>



    </div>
  )
}

export default OurFaculity
