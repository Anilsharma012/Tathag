import React from "react";
import { useNavigate } from "react-router-dom";

import "./ForthPage.css";
import WhySection from "../../whySection/WhySection";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";


import image4 from "../../../images/overall/20.PNG";
import image5 from "../../../images/overall/21.PNG";
import image6 from "../../../images/overall/22.PNG";

import image8 from "../../../images/overall/24.PNG";
import image9 from "../../../images/overall/25.PNG";
import image10 from "../../../images/overall/29.PNG";

const images = [ image4, image5, image6,image8,image9,image10];

const ForthPage = () => {
  const navigate=useNavigate()
  return (
    <>
      <section className="tf-testimonial-section">
        <div className=" tf-testimonial-left">
          <iframe
            className="tf-testimonial-video-img"
            src="https://www.youtube.com/embed/uENlBxSGf-Q?si=rhQ4g1oO6qu3Tppa"
            title="Testimonial Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          {/* <div className="testimonial-play-btn">▶</div> */}
          <div className="tf-testimonial-bottom-info">
           
            {/* <div className="tf-testimonial-nav-btns">
              <button style={{color:"black"}}>←</button>
              <button style={{color:"black"}}>→</button>
            </div> */}
          </div>
        </div>

        <div className="tf-testimonial-right">
          <h2 className="tf-testimonial-heading">Hear From Our Achievers</h2>
          <div className="tf-testimonial-cards tf-image-scrollable-grid">
            {images.map((img, idx) => (
              <LazyLoadImage
                key={idx}
                src={img}
                alt={`testimonial-${idx}`}
                className="tf-testimonial-only-img"
              />
            ))}
          </div>

          <p className="tf-read-all-link" onClick={()=>navigate("/score-card")}>Read All →</p>
        </div>
      </section>

      <WhySection />
    </>
  );
};

export default ForthPage;
