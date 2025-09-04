import React,{useState} from 'react'
import "./ExploreBlog.css"
import { FaCalendarAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import footerOne from "../../images/footer1.png";
import footerTwo from "../../images/footer2.png";
import footerThree from "../../images/footer3.png";
import footerfour from "../../images/footer4.png";
import footerfive from "../../images/AboutFour.png";
import footersix from "../../images/AboutThree.png";
import footereight from "../../images/AboutOne.png";
import footerseven from "../../images/AboutTwo.png";
import footernine from "../../images/1.png";
import footerten from "../../images/2.png";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";



const allData = [
  { id: 1, image: footerOne, date: "Feb 24, 2025", title: "CUET Prep Guide" },
  { id: 2, image: footerTwo, date: "Feb 25, 2025", title: "CAT Success Story" },
  { id: 3, image: footerThree, date: "Feb 26, 2025", title: "Toppers' Journey" },
  { id: 4, image: footerfour, date: "Feb 27, 2025", title: "MBA Prep Tips" },
  { id: 5, image: footerfive, date: "Feb 24, 2025", title: "CUET Strategy Insights" },
  { id: 6, image: footersix, date: "Feb 25, 2025", title: "CAT Study Plan" },
  { id: 7, image: footerseven, date: "Feb 26, 2025", title: "Toppers' Preparation Secrets" },
  { id: 8, image: footereight, date: "Feb 27, 2025", title: "Advanced MBA Tips" },
  { id: 9, image: footerseven, date: "Feb 24, 2025", title: "CUET Exam Hacks" },
  { id: 10, image: footereight, date: "Feb 25, 2025", title: "CAT Motivation Story" }
];

const dataMap = {
  "All": allData,
  "Top Blogs": [
    { id: 1, image: footerOne, date: "Feb 24, 2025", title: "CUET Prep Guide" },
    { id: 2, image: footerTwo, date: "Feb 25, 2025", title: "CAT Success Story" }
  ],
  "CAT Preparation": [
    { id: 3, image: footerThree, date: "Feb 26, 2025", title: "CAT Prep Tips" },
    { id: 9, image: footerfour, date: "Feb 27, 2025", title: "CAT Shortcut Methods" }
  ],
  "IPMAT Preparation": [
    { id: 4, image: footerfive, date: "Feb 27, 2025", title: "IPMAT Strategy Guide" }
  ],
  "XAT Preparation": [
    { id: 5, image: footersix, date: "Feb 28, 2025", title: "XAT Exam Strategy" }
  ],
  "MBA": [
    { id: 6, image: footerseven, date: "Mar 01, 2025", title: "MBA Success Tips" }
  ],
  "Exam Updates": [
    { id: 7, image: footereight, date: "Mar 02, 2025", title: "Latest Exam Guide" }
  ],
  "GMAT": [
    { id: 8, image: footersix, date: "Mar 03, 2025", title: "GMAT Prep Essentials" }
  ],
  "After 12th": [
    { id: 8, image: footerfive, date: "Mar 03, 2025", title: "Career Options After 12th" }
  ]
};


const ExploreBlog = () => {
      const [activeTag, setActiveTag] = useState("All");

  const handleScroll = (dir) => {
    const container = document.getElementById('blog-scroll-container');
    if (container) {
      container.scrollBy({
        left: dir === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };
  return (
    <div>
            <section className="tm-blog-slider-wrapper">
      <div className="tme-blog-header">
        <div>
          <p className="tm-headerBlog">Explore our blog</p>
          <h2>
            Unlock Success Through
            <br />
            Knowledge
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

      <div className="tme-blog-filter-buttons">
        {Object.keys(dataMap).map((tag, idx) => (
          <button
            key={idx}
            className={activeTag === tag ? 'active-filter' : ''}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="tm-blog-cards-container" id="blog-scroll-container">
        {dataMap[activeTag].map((blog) => (
          <div key={blog.id} className="tmc-blog-card">
            <LazyLoadImage
              src={blog.image}
              alt="tm-blog thumbnail"
              className="tm-blog-image"
            />
            <div className="tm-blog-info">
              <span className="tm-blog-date">
                <FaCalendarAlt /> {blog.date}
              </span>
              <h4>{blog.title}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="tm-Blog-Footer-Main">
        <div className="tm-blog-footer">
          <button className="tm-arrow-button" onClick={() => handleScroll('left')}>
            <FaArrowLeft />
          </button>
          <div className="tm-slider-indicator" />
          <button className="tm-arrow-button" onClick={() => handleScroll('right')}>
            <FaArrowRight />
          </button>
        </div>
        <div className="tm-view-all-button">
          <button>View all</button>
        </div>
      </div>
    </section>
      
    </div>
  )
}

export default ExploreBlog
