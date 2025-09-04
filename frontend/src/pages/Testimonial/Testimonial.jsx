import React from 'react'
import './Testimonial.css'
import { useNavigate } from 'react-router-dom'

import team from "../../images/trophy.png"
import team1 from "../../images/classOne.png"
import team2 from "../../images/classTwo.png"
import team3 from "../../images/classThree.png"
import team4 from "../../images/classFour.png"

import hero from "../../images/Toppers/LUV.jpg"
import hero1 from "../../images/Toppers/hARSHIT.jpg"
import hero2 from "../../images/Toppers/UDAI.jpg"
import hero3 from "../../images/Toppers/KUSHAGRA.jpg"


import score from "../../images/Review2/success-five.PNG"
import score1 from "../../images/Review2/success-four.PNG"
import score2 from "../../images/Review2/success-three.PNG"
import score4 from "../../images/Review2/success-two.PNG"
import score3 from "../../images/Review/R10.PNG"
import score5 from "../../images/teacherReview/our1.PNG"



import testi1 from "../../images/REVIEW1.PNG";
import testi2 from "../../images/REVIEW2.PNG";
import testi3 from "../../images/REVIEW3.PNG";
import testi4 from "../../images/REVIEW4.PNG";
import testi5 from "../../images/REVIEW5.PNG";
import testi6 from "../../images/REVIEW6.PNG";




import review2 from "../../images/Review2/success-three.PNG"
import review3 from "../../images/Review2/success-four.PNG"
import review4 from "../../images/Review2/success-five.PNG"


import ravi from "../../images/Review/gitika.jpeg"
import ravi2 from "../../images/Toppers/LUV.jpg"
import ravi3 from "../../images/Review/jatin.jpeg"
import ravi4 from "../../images/Review/KUSH.jpeg"
import ravi5 from "../../images/Review/dristhi.jpeg"
import ravi6 from "../../images/Toppers/MUDIT RASTOGI.jpg"


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


const data = [
  { name: "Mock 1", Rohan: 65, Simran: 60, Arpit: 55 },
  { name: "Mock 2", Rohan: 72, Simran: 67, Arpit: 59 },
  { name: "Mock 3", Rohan: 79, Simran: 70, Arpit: 63 },
  { name: "Final", Rohan: 94, Simran: 85, Arpit: 74 }
];



function Testimonial() {

  const reviews = new Array(6).fill({
    name: "Rohit Sharma",
    score: "CAT 99.8%ile",
    message: "TathaGat’s workshops helped me build clarity and confidence in solving real exam problems with the right mindset."
  });

  const workshopImages = [
    "https://via.placeholder.com/300x200?text=Workshop+1",
    "https://via.placeholder.com/300x200?text=Workshop+2",
    "https://via.placeholder.com/300x200?text=Workshop+3",
    "https://via.placeholder.com/300x200?text=Workshop+4"
  ];

  const stories = [
    {
      text: `Commitment to maximize a student's CAT scorecard is unprecedented.  `,
      name: "Gitika",
      college: "IIM Kozhikode",
      image: ravi

    },
    {
      text: ` Preparing for CAT is a journey which can transform you as a person..`,
      name: "Luv Saxena",
      college: "IIM Bangalore",
      image: ravi2

    },
    {
      text: `Tathagat was instrumental in helping me get to my dream college (IIM Calcutta). .`,
      name: "Jatin Tuteja",
      college: "IIM-Calcutta",
      image: ravi3

    },
    {
      text: `There are simply no words to describe the learning and experience that i had .`,
      name: "Kush Saxena",
      college: "FMS",
      image: ravi4

    },
    {
      text: `The classroom environment created by the teachers kept me motivated throughout.`,
      name: "Drishti Agrawal",
      college: "IIFT",
      image: ravi6

    },
    {
      text: `I still feel indebted to the college senior who told me about TG while I was preparing. `,
      name: "Mahima Shah  ",
      college: "IIM Lucknow ",
      image: ravi5

    }
  ];

  const reviewPic = [score, score1, score2, score3, score4, score5]


  const testimonials = [
    testi1, testi2, testi3, testi4, testi5, testi6,testi1, testi2, testi3, testi4
  ];


  const images = [score, score1, score2]



  let scrollContainer = null;

  const scrollLeft = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const navigate=useNavigate()


  return (
    <>
      <div id='page3'>


        <div className="ts-wrapper">
          <div className="ts-left">
            <p className="ts-subtag">SUCCESS SPEAKS LOUDER THAN WORDS</p>
            <h2 className="ts-title">Trusted By Thousands Of Students Across India</h2>
            <p className="ts-desc">
              Real stories. Real results. Hear from the students who turned <br />
              their dreams into reality with TathaGat’s expert guidance.
            </p>
            <button className="ts-btn">Book a Free Counselling</button>

            <div className="ts-countering">
              <div><h3>2000+</h3><p>Google Reviews</p></div>
              <div><h3>12000+</h3><p>Class Reviews</p></div>
              <div><h3>5000+</h3><p>Chats Reviews</p></div>
            </div>

            <div className="ts-awards">
              <div className="ts-award-title">🏆 Awards of Achievements by TathaGat</div>

              <div className="ts-award-flex-line">
                <div className="ts-award-col ts-year">2025</div>
                <div className="ts-award-col ts-tag">
                  <span className="top">Shiksha</span><br />
                  <span className="bottom">Coach</span>
                </div>
                <div className="ts-award-col ts-rank">1st</div>
                <div className="ts-award-col ts-summary">
                  Ranked No. 1 among 36 coaching institutes in Delhi
                </div>
              </div>

              <div className="ts-award-ranks-boxes">
                <p>Ranked No. 1 coaching<br />institute in Delhi by Shiksha Coach <br />in 2024</p>
                <p>Ranked No. 1coaching<br />institute in Delhi by WAAC<br />in 2020</p>
                <p>Ranked No. 6 coaching<br />institute in Delhi by India Today<br />in 2020</p>
              </div>
            </div>
          </div>

          <div className="ts-right">
            <div className="ts-testimonial-scroll">
              {testimonials.map((item, i) => (
                <div className="ts-testimonial-image-card" key={i}>
                  <img src={item} alt='' className="ts-testimonial-full-image" />
                </div>
              ))}
            </div>
          </div>
        </div>


        <div className="tgL-section">

          <div className="tgL-left">
            <h2 className="tgL-heading">99%ile In CAT!</h2>
            <div className="tgL-card-scroll">
              {[score, score1, score2].map((imgSrc, i) => (
                <div key={i} className="tgL-card">
                  <img src={imgSrc} alt={`Success ${i + 1}`} className="testimonial-full-image" />
                </div>
              ))}
            </div>
          </div>


 
          <div className="tgL-right">
            <div className="tgL-box">
              <div className="tgL-box-heading">
                Why Students Trust TathaGat?
                <span className="tgL-arrow">↗</span>
              </div>
              <p className="tgL-box-desc">
                Since 2007, TathaGat has helped thousands crack exams like CAT, XAT,
                GMAT, and SNAP with expert mentors, concept-focused learning, and
                personalized guidance in small batches.
              </p>

              <div className="tgL-badges">
                {[
                  "Personalized Attention",
                  "Concept-Driven Class",
                  "Practice Session",
                  "Doubts And Discussion",
                  "Mentors With 99+ Percentiles",
                  "Real-Time Strategy",
                  "Workshops",
                ].map((text, idx) => (
                  <div key={idx} className="tgL-badge">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        <section className="why-container">
          <div className="why-left">
            <h3 className="why-heading">Why Choose TathaGat Courses?</h3>
            <p className="why-description">
              At TathaGat, we don’t just teach — we mentor, challenge, and transform students to achieve their highest potential in competitive exams like CAT, XAT, SNAP, and CMAT. Our courses are built on years of expertise, deep understanding of exam patterns, and a proven track record of producing top scorers.
            </p>
            <button className="why-button">View Course Page</button>
          </div>
          <div className="why-right">
            <div className="why-card">
              <img src={hero} alt="Harshit Bhalla" className="why-image" />
              <h4 className="why-name">LUV SAXENA</h4>
              <p className="why-percentile">99.98 %ILE</p>
            </div>
            <div className="why-card">
              <img src={hero1} alt="Raghav Garg" className="why-image" />
              <h4 className="why-name">ADITYA DANG</h4>
              <p className="why-percentile">99.41 %ILE</p>
            </div>
            <div className="why-card">
              <img src={hero2} alt="Sanjana Singh" className="why-image" />
              <h4 className="why-name">HARSHIT BHALLA</h4>
              <p className="why-percentile">99.33 %ILE</p>
            </div>
            <div className="why-card">
              <img src={hero3} alt="Arav Jain" className="why-image" />
              <h4 className="why-name">KUSHAGRA</h4>
              <p className="why-percentile">99.25 %ILE</p>
            </div>
          </div>
        </section>




        <div className="tgc-conversations">
          <div className="tgc-convo-headings">
            <h2>Conversations That Count</h2>
            <p className="tgc-convo-sub">Success Stories That Inspire</p>
            <p className="tgc-convo-desc">
              See how determined students, guided by expert mentors at TathaGat,
              transformed challenges<br></br> into top scores and B-school admits.
            </p>
          </div>

          <div className="tgc-convo-grid">
            <div className="tgc-scroll-wrapper">
              <div className="tgc-image-card">
                <img src={review2} alt="Success Story 1" className="tgc-cover-img" />
              </div>

              <div className="tgc-image-card">
                <img src={review3} alt="Success Story 1" className="tgc-cover-img" />
              </div>

              {/* <div className="tgc-image-card">
                <img src={review4} alt="Success Story 1" className="tgc-cover-img" />
              </div> */}

            </div>

            <div className="tgc-video-card-wrapper">
              <div className="tgc-video-header">
                <div>
                  <h4>Hear It from Our Achievers</h4>
                  <p>Real Stories. Real Results. Real Confidence.</p>
                </div>
              </div>

              <div className="tgc-video-card">
                <div className="tgc-video-frame">
                  <iframe
                    width="100%"
                    height="200"
                    src="https://www.youtube.com/embed/EHBQ3AJ-uEo"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* VIDEO CARD 2 + Button */}
            <div className="tgc-video-card-wrapper">
              <div className="tgc-video-header tgc-video-header-right">
                <button className="tgc-view-all" onClick={()=>navigate("/image-gallery")}>View all videos</button>
              </div>

              <div className="tgc-video-card">
                <div className="tgc-video-frame">
                  <iframe
                    width="100%"
                    height="200"
                    src="https://www.youtube.com/embed/IVnBi5uPHW0"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              
            </div>
          </div>
        </div>



        <div className="tgA-about-section">
          <h4 className="tgA-subtitle">About TathaGat</h4>
          <h2 className="tgA-title">Get to know us</h2>

          <div className="tgA-cards-wrapper">
            <div className="tgA-card">
              <span className="tgA-link">Meet our <br /> trainers</span>
              <span className="tgA-icon">↗</span>
            </div>
            <div className="tgA-card">
              <span className="tgA-link">Learn more about <br /> training at TathaGat</span>
              <span className="tgA-icon">↗</span>
            </div>
            <div className="tgA-card">
              <span className="tgA-link">Be a TGite, appreciate <br /> your growth!</span>
              <span className="tgA-icon">↗</span>
            </div>
          </div>
        </div>


        <section className="ttt-tab-section">
          <div className="ttt-tab-container">
            <div className="ttt-tab-header">
              <div>
                <h2 className="ttt-tab-title">Hear It From Our Achievers</h2>
                <p className="ttt-tab-subtext">Real experiences across every stage of preparation</p>
                <p className="ttt-tab-desc">
                  At TathaGat, every step of your preparation journey is thoughtfully designed—from concept-cracking workshops to strategic SOP & interview sessions. Here’s what achievers have to say.
                </p>
              </div>
              <div className="ttt-tab-trophy"><img src={team} alt='' /></div>
            </div>

            <div className="ttt-tab-tabs">
              {["Workshops", "Mentors", "Test Series", "Interview Prep", "Application Classes"].map((tab, i) => (
                <button key={i} className={`ttt-tab-tab ${i === 0 ? "ttt-active" : ""}`}>{tab}</button>
              ))}
            </div>

            <div className="ttt-tab-content">
              <div className="ttt-tab-testimonials">
                <h3 className="ttt-tab-gallery-titleee">Students reviews on workshops</h3>
                <div className="ttt-tab-review-grid">
                  {reviewPic.map((t, i) => (
                      <div className="ttt-tab-card" key={i}>
                        <img src={t} alt='' className="ttt-testimonial-full-image1" />
                      </div>
                  ))}

                  {/* <div className="ttt-tgv-slider-wrapper">
                    <div className="ttt-tgv-circle-btn">
                      <span>&larr;</span>
                    </div>
                    <div className="ttt-tgv-progress-bar">
                      <div className="ttt-tgv-progress-fill"></div>
                    </div>
                    <div className="ttt-tgv-circle-btn">
                      <span>&rarr;</span>
                    </div>
                  </div> */}
                </div>
              </div>

              <div className="ttt-tab-gallery">
                <h3 className="ttt-tab-gallery-titleee">Workshop Days at TathaGat!</h3>
                <div className="ttt-tab-gallery-grid">
                  <img src={team1} alt='' />
                  <img src={team2} alt='' />
                  <img src={team3} alt='' />
                  <img src={team4} alt='' />
                </div>
              </div>
            </div>
          </div>
        </section>










        <section className="tgx-success-section">
          <div className="tgx-success-container">
            <div className="tgx-success-left">
              <h3 className="tgx-title">Visualizing Success</h3>
              <p className="tgx-desc">
                At TathaGat, we don’t just teach — we track, mentor, and transform.
                This success graph highlights the journey of our students across
                multiple mock tests leading up to their final exam scores.
              </p>
              <p className="tgx-desc">
                You can clearly see the consistent upward growth in performance after
                joining TathaGat — thanks to our structured approach, one-on-one
                mentoring, and test-specific strategies.
              </p>

              <h5 className="tgx-sub">What does this graph show?</h5>
              <p className="tgx-graph-note">
                A steady score improvement across each mock test, right from the point
                they joined TathaGat — proving that targeted effort under expert
                mentorship delivers results.
              </p>

              <div className="tgx-tags">
                <span>Personalized Attention in Small Batches</span> <br />
                <span>Mentors With 99+ Percentiles And Actual Test-Taking Experience</span>
                <span>Real-Time Strategy Guidance Throughout Your Journey</span>
                <span>Concept-Driven Content That Simplifies The Toughest Topics</span>
              </div>
            </div>

            <div className="tgx-success-right">
              <h4 className="tgx-chart-title">Student Success at TathaGat</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[50, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Rohan" stroke="#f98500" strokeWidth={2} />
                  <Line type="monotone" dataKey="Simran" stroke="#7f8ce0" strokeWidth={2} />
                  <Line type="monotone" dataKey="Arpit" stroke="#3da8f5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>

              <div className="tgx-legend">
                <div className="tgx-legend">
                  <img src={hero} alt="Harshit Bhalla" className="tgx-image" />
                  <h4 className="why-name">LUV SAXENA</h4>
                  <p className="why-percentile">99.98 %ILE</p>
                </div>
                <div className="tgx-legend">
                  <img src={hero1} alt="Raghav Garg" className="tgx-image" />
                  <h4 className="tgx-name">ADITYA DANG</h4>
                  <p className="tgx-percentile">99.41 %ILE</p>
                </div>
                <div className="tgx-legend">
                  <img src={hero2} alt="Sanjana Singh" className="tgx-image" />
                  <h4 className="tgx-name">HARSHIT BHALLA</h4>
                  <p className="tgx-percentile">99.33 %ILE</p>
                </div>
                </div>
            </div>
          </div>
        </section>









        <section className="s-section">
          <div className="s-container">
            <h2 className="s-heading">Success Stories That Inspire</h2>
            <p className="s-subheading">
              See how determined students, guided by expert mentors at TathaGat,
              transformed challenges into top scores and B-school admits.
            </p>
            <div className="s-stories">
              {stories.map((story, index) => (
                <div className="s-card" key={index}>
                  <p className="s-text">{story.text}</p>
                  <a href="#" className="s-read-more">Read story →</a>
                  <div className="s-profile">

                    <img src={story.image} alt='' className="s-avatar" />

                    <div>
                      <p className="s-name">{story.name}</p>
                      <p className="s-college">{story.college}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>



          </div>
        </section>


      </div>
    </>
  )
}

export default Testimonial