import React, { useState, useRef, useEffect } from 'react';
import './Team.css';

import rajat from "../../images/Team/Rajat 5.png";
import kumar from "../../images/Team/KumarSir.png";
import niraj from "../../images/Team/Niraj-Sir.png";
import kishan from "../../images/Team/Kishan.png";
import sneha from "../../images/Team/Sneha-Malik.png";
// import sandeep1 from "../../images/Team/Sandeep.png"; // not used
import sandeep2 from "../../images/Team/Sandeep (1).png";
import azhar from "../../images/Team/Azhar.png";
import lydia from "../../images/Team/Lydia.png";

import testimonial2 from '../../images/success-two.PNG';
import testimonial3 from '../../images/success-three.PNG';
import testimonial4 from '../../images/success-four.PNG';
import testimonial5 from '../../images/success-five.PNG';

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { ArrowUpRight } from 'lucide-react';
import FAQ from '../../components/FAQ/FAQ';

const teamData = [
  { name: 'Rajat kumar', image: rajat },
  { name: 'Kumar Abhishek', image: kumar },
  { name: 'Neraj Naiyar', image: niraj },
  { name: 'Kishan Bhardwaj', image: kishan },
  { name: 'Lydia', image: lydia },
  { name: 'Sneha Malik', image: sneha },
  // { name: 'Sandeep', image: sandeep1 },
  { name: 'Himanshu', image: sandeep2 },
  { name: 'Azhar', image: azhar },
];

const videos = [
  "https://youtu.be/J_QoDDzzbyI",
  "https://youtu.be/EHBQ3AJ-uEo",
  "https://youtu.be/JHgNoNlucTg",
  "https://youtu.be/1x9lbk01Tn4",
  "https://youtu.be/Ctb23J-46cM",
  "https://youtu.be/6ODXAKkACS4",
  "https://youtu.be/IVnBi5uPHW0"
];

const testimonials = [testimonial2, testimonial3, testimonial4, testimonial5];

const Team = () => {
  // Filters
  const [visibleVideos, setVisibleVideos] = useState(videos);
  const handleFilter = (category) => {
    if (category === "All") setVisibleVideos(videos);
    else if (category === "QUANT") setVisibleVideos(videos.slice(4, 7)); // 5,6,7
    else if (category === "VARC") setVisibleVideos(videos.slice(0, 4));  // 1,2,3,4
    else if (category === "LRDI") setVisibleVideos(videos.slice(2, 6));  // 3,4,5,6
  };

  // Smooth scroll refs
  const topRef = useRef(null);
  const rajatRef = useRef(null);
  const demoRef = useRef(null);
  const scrollTo = (ref) => ref?.current?.scrollIntoView({ behavior: "smooth" });

  // Optional popup
  const [showPopup, setShowPopup] = useState(false);
  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  // Helpers
  const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Auto-fetch YouTube meta (title); author is fetched but NOT shown now
  const [videoMeta, setVideoMeta] = useState({}); // { [url]: { title, author } }

  useEffect(() => {
    let isMounted = true;

    const fetchMeta = async (url) => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        );
        if (!res.ok) throw new Error("oEmbed error");
        const json = await res.json();
        if (isMounted) {
          setVideoMeta((prev) => ({
            ...prev,
            [url]: {
              title: json.title || "Video",
              author: json.author_name || "TathaGat Faculty",
            },
          }));
        }
      } catch {
        if (isMounted) {
          setVideoMeta((prev) => ({
            ...prev,
            [url]: { title: "Video", author: "TathaGat Faculty" },
          }));
        }
      }
    };

    videos.forEach((url) => {
      if (!videoMeta[url]) fetchMeta(url);
    });

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="tt-team-wrapper">
        <h1 className="tt-team-title">Group Image</h1>
      </div>

      <div className="tt-team-section" ref={topRef}>
        <div className="tt-team-header">
          <div className="tt-team-heading">
            <h2>Meet the talented team which makes all this happen</h2>
          </div>
          <div className="tt-team-description">
            <p>
              At TathaGat, our mentors don’t just teach — they guide, support, and transform.
              With 99+ percentile scores and real test experience in CAT, GMAT, XAT, and SNAP,
              they offer one-on-one attention, clear concepts, and proven strategies to help you truly understand and succeed.
            </p>
          </div>
        </div>

        <div className="tt-team-grid">
          {teamData.map((member, index) => (
            <div className="tt-team-card" key={index}>
              <LazyLoadImage src={member.image} alt={member.name} />
              <div className="tt-team-name">{member.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rajat-container" ref={rajatRef}>
        <div className="rajat-top">
          <div className="rajat-image">
            <LazyLoadImage src={rajat} effect='blur' alt="Rajat Kumar" />
          </div>
          <div className="rajat-content">
            <h1>Rajat Kumar</h1>
            <h3 className="rajat-title">An IIT Alumnus with 18+ Years of Excellence in CAT Training</h3>
            <p>
              With over 18 years of experience mentoring aspirants for CAT and other management exams,
              he brings a rare blend of academic strength, progressive thinking, and entrepreneurial vision.
              His uncompromising focus on quality and student outcomes has been instrumental in establishing
              TathaGat as one of the most trusted names in MBA test prep.
            </p>
            <button className="tgv-rjt-button">Book Free Counselling</button>
          </div>
          <div className="rajat-side-faces">
            <LazyLoadImage effect='blur' src={kumar} alt="Kumar Abhishek" />
            <LazyLoadImage effect='blur' src={niraj} alt="Niraj Naiyar" />
          </div>
        </div>

        <div className='testimonial-part'>
          <h2 className="testimonial-heading">Testimonial</h2>
          <div className="testimonial-slider">
            <div className="testimonial-track">
              {testimonials.map((img, idx) => (
                <div className='tt-testimonial-item' key={idx}>
                  <LazyLoadImage effect='blur' src={img} alt={`Testimonial ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section" ref={demoRef}>
        <h2 className="demo-title">Real classroom energy. Real concept clarity.</h2>
        <p className="demo-subtext">
          Before you join us, see how we teach. Watch demo clips from our top faculty as they break down
          concepts, share strategies, and make learning engaging and effective.
        </p>

        <div className="tgv-scroll-wrapper">
          <div className="demo-buttons">
            <button onClick={() => handleFilter("All")}>All Category</button>
            <button onClick={() => handleFilter("QUANT")}>QUANT</button>
            <button onClick={() => handleFilter("VARC")}>VARC</button>
            <button onClick={() => handleFilter("LRDI")}>LRDI</button>
          </div>
        </div>

        <div className="video-scroll">
          {visibleVideos.map((link, index) => {
            const id = getYouTubeID(link);
            const meta = videoMeta[link];
            return (
              <div className="video-card" key={index}>
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title={meta?.title ? `${meta.title}` : `Video ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>

                <div className="video-info">
                  <span className="video-label">Watch Video</span>
                  <h3 className="video-title">{meta?.title || "Loading..."}</h3>
                  {/* Author line removed as requested */}
                  <a
                    className="video-cta"
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Watch Now →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="about-strip">
        <div className="about-left">
          <p>About TathaGat</p>
          <h2>Get to know us</h2>
        </div>
        <div className="about-right">
          <div className="about-link" onClick={() => scrollTo(topRef)}>
            <div className="about-text">
              <strong>Meet</strong>
              <span>our trainers</span>
            </div>
            <div className="about-icon">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="about-link" onClick={() => scrollTo(rajatRef)}>
            <div className="about-text">
              <strong>Learn</strong>
              <span>more about training at TathaGat</span>
            </div>
            <div className="about-icon">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="about-link" onClick={() => scrollTo(demoRef)}>
            <div className="about-text">
              <strong>Be</strong>
              <span>a TGite, appreciate your growth!</span>
            </div>
            <div className="about-icon">
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>

        {showPopup && (
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-box" onClick={(e) => e.stopPropagation()}>
              <h3>Welcome to TathaGat!</h3>
              <p>This is your popup content. You can customize it as needed!</p>
              <button onClick={closePopup}>Close</button>
            </div>
          </div>
        )}
      </div>

      <FAQ />
    </>
  );
};

export default Team;
