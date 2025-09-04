import React, { useState } from "react";
import "./SuccessStory.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import successOne from "../../images/success-one.png";
import successtwo from "../../images/success-two.PNG";
import successthree from "../../images/success-three.PNG";
import successfour from "../../images/success-four.PNG";
import successfive from "../../images/success-five.PNG";
import ourTeam from "../../images/ourTeam.png";
import { useNavigate } from "react-router-dom";
import FAQ from "../../components/FAQ/FAQ";
import LazyImage from "../../components/LazyImage/LazyImage";
const teamImages = [ourTeam, ourTeam, ourTeam];

const SuccessStory = () => {
  const achieversData = [
    {
      name: "Simran Kaur",
      score: "CAT 99.53%",
      image: "https://img.youtube.com/vi/h1LNMSAxuLQ/hqdefault.jpg",
      videoUrl: "https://youtu.be/h1LNMSAxuLQ",
    },
    {
      name: "Simran Kaur",
      score: "CAT 99.53%",
      image: "https://img.youtube.com/vi/oaPp-eKk1aA/hqdefault.jpg",
      videoUrl: "https://youtu.be/oaPp-eKk1aA",
    },
    {
      name: "Simran Kaur",
      score: "CAT 99.53%",
      image: "https://img.youtube.com/vi/ozZuWTUl5Lg/hqdefault.jpg",
      videoUrl: "https://youtu.be/ozZuWTUl5Lg",
    },
    {
      name: "Simran Kaur",
      score: "CAT 99.53%",
      image: "https://img.youtube.com/vi/1x9lbk01Tn4/hqdefault.jpg",
      videoUrl: "https://youtu.be/1x9lbk01Tn4",
    },
  ];

  const testimonials = [
    {
      name: "Gourav Sharma",
      score: "CAT 99.8%ile",
      image: successtwo,
      message:
        "I studied at TathaGat back in 2014. TG exceeded my expectations...",
      author: "Prabhat Ralhan",
      stars: 5,
    },
    {
      name: "Pranjal Malhotra",
      score: "CAT 99.6%ile",
      image: successthree,
      message: "The study materials were comprehensive and well-structured...",
      author: "Prabhat Ralhan",
      stars: 5,
    },
    {
      name: "Shivam Sharma",
      score: "CAT 99.7%ile",
      image: successfour,
      message: "Faculty were exceptionally knowledgeable and experienced...",
      author: "Prabhat Ralhan",
      stars: 5,
    },
    {
      name: "Amit Raj",
      score: "CAT 99.7%ile",
      image: successfive,
      message: "Faculty were exceptionally knowledgeable and experienced...",
      author: "Prabhat Ralhan",
      stars: 5,
    },
    {
      name: "Gourav Sharma",
      score: "CAT 99.8%ile",
      image: successtwo,
      message:
        "I studied at TathaGat back in 2014. TG exceeded my expectations...",
      author: "Prabhat Ralhan",
      stars: 5,
    },
    {
      name: "Gourav Sharma",
      score: "CAT 99.8%ile",
      image: successtwo,
      message:
        "I studied at TathaGat back in 2014. TG exceeded my expectations...",
      author: "Prabhat Ralhan",
      stars: 5,
    },
  ];

  const [index, setIndex] = useState(0);

  const next = () => setIndex((index + 1) % teamImages.length);
  const prev = () =>
    setIndex((index - 1 + teamImages.length) % teamImages.length);

  const navigate = useNavigate();

  return (
    <>
      <div className="success-container">
        <h1 className="success-heading">The Success Story</h1>

        <div className="success-content">
          <div className="text-section">
            <h3>Mehak Sharma</h3>
            <h2>From Self-Doubt To IIM Ahmedabad</h2>
            <p className="successStrong">
              "I still remember the first day I walked into TathaGat — unsure,
              overwhelmed, and full of self-doubt. I had never scored beyond 80
              percentile in any mock test. CAT felt like an impossible dream."
            </p>
            <p className="SuccessP">
              When Mehak Sharma joined TathaGat's classroom program in April
              2023, she wasn't a "natural topper." In fact, her background in
              humanities and lack of math confidence made quant a nightmare. But
              what she lacked in confidence, she made up for in consistency.
            </p>
            <p className="SuccessP">
              At TathaGat, she found what every aspirant craves — mentors who
              saw potential before she could, peer support that felt like
              family, and a systematic plan that made even the toughest concepts
              digestible.
            </p>
            <p className="SuccessP">
              From solving basics to attending 10-hour workshops, from CopyCATs
              to the Toppers' Batch — Mehak gave it her all. Her turning point?
              The Decision Making module for XAT, where she realized: strategy
              matters more than speed.
            </p>
            <p className="SuccessP">
              She scored a 99.89 percentile in CAT and received calls from IIM
              A, B, C, FMS, and XLRI.
            </p>
            <p className="SuccessP">
              And yes — she finally made it to her dream B-school: IIM
              Ahmedabad. Mehak 🖤
            </p>
            <p className="SuccessP">Mehak 🖤</p>
            <button
              className="read-button"
              onClick={() => alert("Next story coming soon!")}
            >
              Read Next Story
            </button>
          </div>

          <div className="image-section">
            <LazyLoadImage
              src={successOne}
              alt="Success"
              effect="blur"
              className="lazy-image"
            />
          </div>
        </div>
      </div>

      <div className="ts-achievers-wrapper">
        <div className="ts-achievers-header">
          <div>
            <h2 className="ts-achievers-title">Our Achievers Interviews</h2>
            <p className="ts-achievers-subtitle">
              Hear from our toppers — their journeys, struggles, strategies, and
              the moments that defined their success. Get inspired to create
              your own.
            </p>
          </div>
          <button className="ts-view-all-btn" onClick={() => navigate("/team")}>
            View all
          </button>
        </div>

        <div className="ts-achievers-grid">
          {achieversData.map((achiever, index) => (
            <a
              key={index}
              href={achiever.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ts-achiever-card"
            >
              <div className="ts-image-container">
                <LazyLoadImage
                  src={achiever.image}
                  alt={achiever.name}
                  effect="blur"
                  className="ts-achiever-image"
                />
                <div className="ts-play-icon">▶</div>
              </div>
              <div className="ts-card-footer">
                <span>{achiever.name}</span>
                <span className="ts-score">{achiever.score}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="ts-demo-wrapper">
        <div className="ts-demo-left">
          <h2 className="ts-demo-heading">
            Attend A Live Demo Class – <br /> For Free!
          </h2>
          <p className="ts-demo-subtext">
            Experience our teaching style, methods, and mentors before you
            decide.
          </p>

          <div className="ts-scrolling-wrapper">
            <div className="ts-scrolling-track">
              {testimonials.map((t, i) => (
                <div key={i} className="ts-testimonial-card">
                  <div className="ts-testimonial-content">
                    <div className="ts-testimonial-header">
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <h4>{t.name}</h4>
                          <span className="ts-score">{t.score}</span>
                        </div>
                        <LazyLoadImage
                          src={t.image}
                          alt={t.name}
                          effect="blur"
                          className="ts-testimonial-image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ts-demo-right">
          <h3>Reserve Your Demo Spot</h3>
          <form className="ts-demo-form">
            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <input type="text" placeholder="Course of Interest" />
            <input type="date" placeholder="Preferred Date" />
            <button
              type="submit"
              onClick={() => alert("Your spot has been reserved!")}
            >
              Reserve Your Spot
            </button>
          </form>
        </div>
      </div>












 
      <div className="ts-blog-team-wrapper">
        {/* Left Side */}
        <div className="ts-blog-team-left">
          <h2 className="ts-blog-team-heading">
            Don't Just Dream It. Crack It <br />
            with Tathagat!
          </h2>
          <button className="ts-blog-contact-btn" onClick={()=>navigate("/GetInTouch")}>Contact Now</button>
        </div>

        {/* Right Side */}
        <div className="ts-blog-team-right">
          <div className="ts-blog-team-header">
            <span
              style={{ fontSize: "24px", fontWeight: "700", color: "black" }}
            >
              Meet the team
            </span>
            <button onClick={()=>navigate("/team")} className="ts-blog-view-all-btn">View all</button>
          </div>

          <div className="ts-blog-team-box">
            <button onClick={prev} className="ts-blog-arrow left">
              ←
            </button>
            <LazyImage
              src={teamImages[index]}
              alt="Team"
              effect="blur"
              className="ts-blog-team-image"
            />
            <button onClick={next} className="ts-blog-arrow right">
              →
            </button>
          </div>
        </div>
      </div>
      <FAQ />





     
    </>
  );
};

export default SuccessStory;
