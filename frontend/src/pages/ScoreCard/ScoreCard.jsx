import React, { useState } from "react";
import "./ScoreCard.css";
import nameOne from "../../images/1.png";
import nameTwo from "../../images/2.png";
import scorcardone from "../../images/ScoreCardOne.png";
import scorcardTwo from "../../images/ScoreCardTwo.png";
import scorcardThree from "../../images/ScoreCardThree.png";
import scorecardfour from "../../images/scoree.jpg"
import scorcardfive from "../../images/scorethirty.jpg";
import scorcardsix from "../../images/scoreten.jpg";
import scorcardseven from "../../images/scoreseven.jpg";
import scorcardeight from "../../images/scorenine.jpg";
import scorcardnine from "../../images/scorefourty.jpg";
import scorcardTen from "../../images/catresult-2_page-0001.jpg";
import scorcardelewen from "../../images/scorefifty.jpg";
import scorcardtewlen from "../../images/scoreelewen.jpg";  
import scorcardThirty from "../../images/scoreeight.jpg";
import scorcardfourty from "../../images/scoreee.jpg";
import scorcardfifty from "../../images/Udai_page-0001.jpg";
import scorcardsixty from "../../images/Raghav 99.png";
import scorcardseventy from "../../images/Cat scorecard_page-0001.jpg";


import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";


import successtwo from "../../images/success-two.PNG"
import successthree from "../../images/success-three.PNG"
import successfour from "../../images/success-four.PNG"
import successfive from "../../images/success-five.PNG"


import review1 from "../../images/Review/R1.PNG"
import review2 from "../../images/Review/R2.PNG"
import review3 from "../../images/Review/R3.PNG"
import review4 from "../../images/Review/R4.PNG"
import review5 from "../../images/Review/R5.PNG"
import review6 from "../../images/Review/R6.PNG"
import review7 from "../../images/Review/R7.PNG"
import review8 from "../../images/Review/R8.PNG"
import review9 from "../../images/Review/R9.PNG"
import review10 from "../../images/Review/R10.PNG"
import review11 from "../../images/Review/R1.PNG"
import review12 from "../../images/Review/R2.PNG"


const scorecardData = [
  {
    name: "Abhishek Kumar",
    percentile: "99.06%",
    photo: nameOne,
    scorecard: scorcardone,
  },
  {
    name: "Riya Sharma",
    percentile: "98.45%",
    photo: nameTwo,
    scorecard: scorcardTwo,
  },
  {
    name: "Mohit Jain",
    percentile: "99.89%",
    photo: nameOne,
    scorecard: scorcardThree,
  },
  {
    name: "Abhishek Kumar",
    percentile: "99.06%",
    photo: nameOne,
    scorecard: scorcardfive,
  },
  {
    name: "Riya Sharma",
    percentile: "98.45%",
    photo: nameTwo,
    scorecard: scorcardsix,
  },
  {
    name: "Mohit Jain",
    percentile: "99.89%",
    photo: nameOne,
    scorecard: scorcardseven,
  },
  {
    name: "Abhishek Kumar",
    percentile: "99.06%",
    photo: nameOne,
    scorecard: scorcardeight,
  },
  {
    name: "Riya Sharma",
    percentile: "98.45%",
    photo: nameTwo,
    scorecard: scorcardnine,
  },
  {
    name: "Mohit Jain",
    percentile: "99.89%",
    photo: nameOne,
    scorecard: scorcardTen,
  },
  {
    name: "Abhishek Kumar",
    percentile: "99.06%",
    photo: nameOne,
    scorecard: scorcardelewen,
  },
  {
    name: "Riya Sharma",
    percentile: "98.45%",
    photo: nameTwo,
    scorecard: scorcardtewlen,
  },
  {
    name: "Mohit Jain",
    percentile: "99.89%",
    photo: nameOne,
    scorecard: scorcardThirty,
  },
  {
    name: "Abhishek Kumar",
    percentile: "99.06%",
    photo: nameOne,
    scorecard: scorcardfourty,
  },
  {
    name: "Riya Sharma",
    percentile: "98.45%",
    photo: nameTwo,
    scorecard: scorcardfifty,
  },
  {
    name: "Mohit Jain",
    percentile: "99.89%",
    photo: nameOne,
    scorecard:scorcardsixty,
  },
   {
    name: "Riya Sharma",
    percentile: "98.45%",
    photo: nameTwo,
    scorecard: scorcardseventy,
  },
  
];

const testimonials = [
  {
    name: 'Gourav Sharma',
    score: 'CAT 99.8%ile',
    image: successtwo, 
    message: 'I studied at TathaGat back in 2014. TG exceeded my expectations...',
    author: 'Prabhat Ralhan',
    stars: 5,
  },
  {
    name: 'Pranjal Malhotra',
    score: 'CAT 99.6%ile',
   image: successthree,
    message: 'The study materials were comprehensive and well-structured...',
    author: 'Prabhat Ralhan',
    stars: 5,
  },
  {
    name: 'Shivam Sharma',
    score: 'CAT 99.7%ile',
    image: successfour,
    message: 'Faculty were exceptionally knowledgeable and experienced...',
    author: 'Prabhat Ralhan',
    stars: 5,
  },
    {
    name: 'Amit Raj',
    score: 'CAT 99.7%ile',
    image: successfive,
    message: 'Faculty were exceptionally knowledgeable and experienced...',
    author: 'Prabhat Ralhan',
    stars: 5,
  },
   {
    name: 'Gourav Sharma',
    score: 'CAT 99.8%ile',
    image: successtwo, 
    message: 'I studied at TathaGat back in 2014. TG exceeded my expectations...',
    author: 'Prabhat Ralhan',
    stars: 5,
  },
  
];

const feedbackImages = [
    review1,review2,review3,review4,review5,review6,review7,review8,review9,review10,review11,review12,


 
];

const ScoreCard = () => {


    const [showAll, setShowAll] = useState(false);

  const visibleImages = showAll ? feedbackImages : feedbackImages.slice(0, 4);





    const [visibleData, setVisibleData] = useState(scorecardData);

  const handleFilter = (type) => {
    if (type === "All") {
      setVisibleData(scorecardData);
    } else if (type === "99") {
      setVisibleData(scorecardData.slice(0, 4)); 
    } else if (type === "98") {
      setVisibleData(scorecardData.slice(4, 8)); 
    } else if (type === "97") {
      setVisibleData(scorecardData.slice(8, 12)); 
    } else if (type === "95") {
      setVisibleData(scorecardData.slice(0, 5)); 
    }
  };
  return (
    <>
      <section className="scorecard-wrapper">
        <div className="scorecard-content">
          <div className="scorecard-heading">
            <h1>TathaGat Scorecard Wall</h1>
            <p>
              See how our students have performed in{" "}
              <strong>CAT, XAT, SNAP</strong> & more!
            </p>
          </div>
          <div className="scorecard-cards">
            <div className="card-box">
              <div className="card-title">500+</div>
              <div className="card-text">
                students scored 99+ percentile in CAT 2024
              </div>
            </div>
            <div className="card-box">
              <div className="card-title">98%ILE</div>
              <div className="card-text">
                scored by 90% students from Toppers'Batch of 120+ Toppers
              </div>
            </div>
          </div>
        </div>
      </section>

    
  <section className="scorecard-wrapper">
      <div className="scorecard-content">
        <div className="scorecard-filters">
          <button onClick={() => handleFilter("All")}>All</button>
          <button onClick={() => handleFilter("99")}>99% +</button>
          <button onClick={() => handleFilter("98")}>98% +</button>
          <button onClick={() => handleFilter("97")}>97% +</button>
          <button onClick={() => handleFilter("95")}>95% +</button>
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: "700" }}>3000 + students</p>
        </div>
      </div>

      <div className="scorecard-grid">
        {visibleData.map((card, index) => (
          <div className="student-card small" key={index}>
            <LazyLoadImage
              effect="blur"
              src={card.scorecard}
              alt={`Scorecard ${index + 1}`}
              className="student-scorecard"
            />
          </div>
        ))}
      </div>
    </section>






 <div className="tss-demo-wrapper">
      {/* Left: Testimonials */}
      <div className="tss-demo-left">
        <h2 className="tss-demo-heading">
          Attend A Live Demo Class – <br /> For Free!
        </h2>
        <p className="tss-demo-subtext">
          Experience our teaching style, methods, and mentors before you decide.
        </p>

        <div className="tss-scrolling-wrapper">
          <div className="tss-scrolling-track">
            {testimonials.map((t, i) => (
              <div key={i} className="tss-testimonial-card">

       <div className="tss-testimonial-content">
       <div className="tss-testimonial-header">
       <div>
        <div style={{display:"flex", justifyContent:"space-between"}}>
        <h4>{t.name}</h4>
        <span className="tss-score">{t.score}</span>
        </div>
        <LazyLoadImage
    src={t.image}
    alt={t.name}
    effect="blur"
    className="tss-testimonial-image"
  />
      </div>
    </div>
  
  </div>
</div>

            ))}
          </div>
        </div>
      </div>


      {/* Right: Form */}
      <div className="tss-demo-right">
        <h3>Reserve Your Demo Spot</h3>
        <form className="tss-demo-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <input type="text" placeholder="Course of Interest" />
          <input type="date" placeholder="Preferred Date" />
          <button type="submit">Reserve Your Spot</button>
        </form>
      </div>
    </div>


    <div className="tgs-wrapper">
      <div className="tgs-inner">
        <div className="tgs-header">
          <h1 className="tg-heading">TathaGat Toppers' Feedback</h1>
          {!showAll && (
            <button className="tgs-btns" onClick={() => setShowAll(true)}>
              View All
            </button>
          )}
        </div>

        
        <div className="tgs-grid">
          {visibleImages.map((src, index) => (
            <div key={index} className="tgs-card">
              <LazyLoadImage
                src={src}
                alt={`feedback-${index + 1}`}
                className="tgs-img"
              />
            </div>
          ))}
        </div>                                                                                                                                                                                                                                                                                                                                                             
      </div>
    </div>
 




    </>
  );
};

export default ScoreCard;