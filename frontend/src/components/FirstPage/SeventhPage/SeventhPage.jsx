import React from "react";
import "./SeventhPage.css";
import {Link, Navigate, useNavigate} from "react-router-dom"

import two from "../../../images/scoreCard/JAI VASHISTH-01.png"
import jalaj from "../../../images/scoreCard/Jalaj Gaba-01.png"



import centerImg from "../../../images/rajat2.png";
import topRightImg from "../../../images/rajat1.png";
import bottomLeftImg from "../../../images/rajat3.png";


// import two from "../../../images/scoreCard/two.png"
import three from "../../../images/scoreCard/three.png"
import four from "../../../images/score1.jpeg"
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import CourseComprasion from "../../CourseComprasion/CourseComprasion";
import ExploreBlog from "../../ExploreBlog/ExploreBlog";
import Myteam from "../../myTeam/Myteam";





const SeventhPage = () => {
  const navigate=useNavigate()



  

  const letters = [
    { char: "A", color: "#001F8B" },
    { char: "C", color: "#FFA500" },
    { char: "H", color: "#2B2F32" },
    { char: "I", color: "#DC4C2F" },
    { char: "E", color: "#F28C82" },
    { char: "V", color: "#001F8B" },
    { char: "E", color: "#2CB456" },
    { char: "R", color: "#3EC2C0" },
    { char: "S", color: "#8A2BE2" },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Jalaj Gaba",
      institute: "99.72%",
      testimonial:
        "TathaGat’s personalized mentorship and rigorous practice sessions helped me achieve 99%ile in CAT. Their approach truly transformed my preparation.",
      score: "CAT 2025\n99.72%",
      image: jalaj, // use your `Frame 621.png` here
    },
    {
      id: 2,
      name: "Jai Vashisth",
      institute: "99.57%",
      testimonial:
        "TathaGat transformed my preparation journey from average to amazing. I owe my success to my mentors at TG. The structure, strategies and classes helped me score so well in CAT.",
      score: "CAT 2025\n99.57%",
      image: two, // use your `Frame 621.png` here
    },
    {
      id: 3,
      name: "Manu Vatsal ",
      institute: "99.54%",
      testimonial:
        "I would credit my performance in the CAT exam solely to TathaGat. Indeed my hard work was not only channelized strategically, but my teachers at TathaGat also kept me motivated and focussed.",
      score: "CAT 2025\n99.54%",
      image:four, // use your `Frame 621.png` here
    },
    // add more if needed
  ];

  return (
    <>
      

      <CourseComprasion/>



<Myteam/>

{/* <section className="tss-our-team-section">
<div className="tss-team-header">
  <div className="tss-header-top">
    <p className="tss-small-title">OUR TEAM</p>
    <h2>The Help You Need When You Need It</h2>
  </div>

  <div className="tss-team-box-wrapper">
    <div className="tss-team-box">
      <LazyLoadImage src={topRightImg} alt="Top Team Member" />
    </div>
    <h3>Kumar Abhishek</h3>
    <p>Founder | Expts - VARC / GDPI</p>
    <div className="tss-plus-buttons">+</div>
  </div>
</div>

<div className="tss-team-center">
      <div className="tss-circle-img">
        <LazyLoadImage src={centerImg} alt="Center Member" />
      </div>
      <h3>Rajat Kumar</h3>
      <p>Founder | Expts - Quant / LRDI</p>
      <div className="tss-plus-buttons">+</div>
    </div>

<div className="tss-team-grid">
   <div className="tss-left-stack">
  <div className="tss-team-box-wrapper">
    <div className="tss-team-box">
      <LazyLoadImage src={bottomLeftImg} alt="Bottom Team Member" />
    </div>
    <h3>Neraj Naiyar</h3>
    <p>Expts - Quant / LRDI</p>
    <div className="tss-plus-buttons">+</div>
  </div>
</div>



  </div>

</section> */}




      
      
      
      <div className="achievers-banner-container">
        {letters.map((item, index) => (
          <div
            key={index}
            className="achiever-box"
            style={{ borderColor: item.color, color: item.color }}
          >
            {item.char}
          </div>
        ))}
      </div>





      <section className="tg-success-section new-success-style">
        <div className="tg-success-left">
          <h2>CAT Success Stories</h2>
          <p>
            TathaGat has consistently produced CAT toppers and 99%ilers, thanks
            to our rigorous training, personalized mentorship, and effective
            strategy sessions. Our students excel by mastering concepts,
            practising real-time questions, and optimizing their exam
            techniques—achieving top scores year after year.
          </p>

          <div className="tg-static-video">
             <iframe
        width="100%"
        // height="500px"
      
        src="https://www.youtube.com/embed/6X9qoILmlVs"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
 
          </div>
        </div>

        <div className="tg-success-right">
          {testimonials.map((item) => (
            <div className="testimonial-carding" key={item.id}>
              <div className="testimonial-info">
                <h4>
                  {item.name} – {item.institute}
                </h4>
                <p>{item.testimonial}</p>
              </div>
              <div className="testimonial-image-box">
  <LazyLoadImage src={item.image} alt={item.name} />
  <div className="testimonial-score-box">
    <p className="name">{item.name}</p>
    <p className="college">{item.institute}</p>
    <p className="score">{item.score}</p>
  </div>
</div>

            </div>
          ))}

      <button onClick={()=>navigate("/ourBlog")} className="view-gallery-btn">
            Explore our Success-Stories
          </button>
        
        </div>
      </section>

      

    <ExploreBlog/>


    </>
  );
};

export default SeventhPage;
