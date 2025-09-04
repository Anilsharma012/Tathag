import React,{useState} from 'react'
import "./ResourcesPageOne.css"
import resourcestwo from "../../images/resourcesTwo.png"
import footerOne from "../../images/footer1.png";
import footerTwo from "../../images/footer2.png";
import footerThree from "../../images/footer3.png";
import footerFour from "../../images/footer4.png";
import { FaArrowLeft, FaArrowRight, FaCalendarAlt } from "react-icons/fa";


const achievers = [
    {
      name: "Priyanshi Malhotra",
      score: "CAT 99.8%ile",
      image: resourcestwo,
      avatar: resourcestwo
    },
    {
      name: "Amit Rao",
      score: "XAT 98.5%ile",
      image: resourcestwo,
      avatar: resourcestwo
    },
    {
      name: "Sneha Verma",
      score: "SNAP 97%ile",
      image: resourcestwo,
      avatar:resourcestwo
    },
    {
      name: "Rahul Iyer",
      score: "GMAT 710",
      image: resourcestwo,
      avatar: resourcestwo
    }
  ];


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

const ResourcesPageOne = () => {

    const [currentIndex, setCurrentIndex] = useState(0);

    const visibleAchievers = achievers.slice(currentIndex, currentIndex + 4);
  
    const handleAvatarClick = (index) => {
      setCurrentIndex(index);
    };
  
    const nextSlide = () => {
      if (currentIndex < achievers.length - 3) {
        setCurrentIndex(currentIndex + 1);
      }
    };
  
    const prevSlide = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
  return (
    <div>
      
      <div className="tf-getting-started-section">
      <div className="tf-getting-left">
        <h2 className="tf-getting-title">Not Sure Where to<br />Start?</h2>
        <p className="tf-getting-subtext">
          Talk to our mentors to get a personalized study plan.
        </p>
        <button className="tf-getting-btn">Enroll Now</button>
      </div>

      <div className="tf-getting-right">
        <h3 className="tf-why-title">Why Us?</h3>
        <ul className="tf-why-list">
          {[
            "Concept Class",
            "Question Solving",
            "Practice Session",
            "Doubts And Discussion",
            "Test",
            "Strategy Sessions",
            "Workshop"
          ].map((item, i) => (
            <li key={i} className="tf-why-item">{item}</li>
          ))}
        </ul>
      </div>
    </div>





    <div className="tf-achievers-section">
      <h2 className="tf-achievers-title">Hear From Our Achievers</h2>
      <p className="tf-achievers-subtext">
        Discover how Tathagat helped thousands of aspirants crack CAT, XAT, SNAP, and GMAT with confidence and excellence.
      </p>

      <div className="tf-achiever-cards">
        {visibleAchievers.map((achiever, index) => (
          <div className="tf-achiever-card" key={index}>
            <img src={achiever.image} className="tf-achiever-img" alt={achiever.name} />
            <div className="tf-achiever-info">
              <img src={achiever.avatar} className="tf-avatar-small" alt="avatar" />
              <div>
                <h4>{achiever.name}</h4>
                <p className="tf-score">{achiever.score}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tf-navigation">
        <button onClick={prevSlide}>&larr;</button>
        <div className="tf-slider-indicators">
          {achievers.map((a, i) => (
            <img
              key={i}
              src={a.avatar}
              className={`tf-avatar-thumb ${i === currentIndex ? 'active' : ''}`}
              onClick={() => handleAvatarClick(i)}
              alt={`slide-${i}`}
            />
          ))}
        </div>
        <button onClick={nextSlide}>&rarr;</button>
      </div>

      <div className="tf-results-link">
        <a href="/results">Check Our Results →</a>
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

export default ResourcesPageOne
