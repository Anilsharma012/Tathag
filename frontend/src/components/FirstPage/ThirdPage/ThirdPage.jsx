import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom"
import "./ThirdPage.css";
import  image1 from "../../../images/Toppers/MUDIT RASTOGI.jpg";
import  image2 from "../../../images/Toppers/UDAI.jpg";
import  image3 from "../../../images/Toppers/LUV.jpg";
import  image4 from "../../../images/Toppers/KUSHAGRA.jpg";
import  image5 from "../../../images/Toppers/hARSHIT.jpg";
import  image6 from "../../../images/Toppers/ADITYA.jpg";
import  image7 from "../../../images/ToppersStudents/top.jpg";
import  image8 from "../../../images/ToppersStudents/top2.jpg";
import  image9 from "../../../images/ToppersStudents/top3.jpg";

import LazyImage from "../../LazyImage/LazyImage"

const statsData = [
  { label: "99%ilers", value: 1200 },
  { label: "95%ilers", value: 8400 },
  { label: "IIM Calls", value: 90000},
];

const ThirdPage = () => {
  const [counts, setCounts] = useState(statsData.map(() => 0));
  const navigate=useNavigate();

  const students = [
    {
      name: "MUDIT RUSTAGI",
      image: image1,
      percentile: "99.99 %ILE",
   
    },
 
    {
      name: "LUV SAXENA",
      image: image3,
      percentile: "99.98 %ILE",
     
    },
      {
      name: "ADITYA DANG",
      image: image6, 
      percentile: "99.41 %ILE",
      
    },
   
    {
      name: "HARSHIT BHALLA",
      image: image5, 
      percentile: "99.33 %ILE",
      
    },
     {
      name: "KUSHAGRA",
      image: image4,
      percentile: "99.25 %ILE",
    
    },
   
       {
      name: "UDAI BAIRARIA",
      image: image2, 
      percentile: "99 %ILE",
     
    }, {
      name: "AYUSH AGGARWAL",
      image: image7,
      percentile: "99.29 %ILE",
     
    }, {
      name: "SHIVAM SHEKHAR",
      image: image8,
      percentile: "99.86 %ILE",
    
    },
     {
      name: "DEEKSHA LAMBA",
      image: image9,
      percentile: "99.25 %ILE",
    
    },

    

  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((count, idx) => {
          const target = statsData[idx].value;
          const increment = Math.ceil(target / 40);
          return count + increment >= target ? target : count + increment;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>

    
    <section className="catresults-container">
      <div className="catresults-top-row">
        <div className="catresults-heading-block">
          {/* <span className="catresults-year">Year <span className="arrow">2024▼</span></span> */}
          <h2 className="catresults-title">Best Results in the Industry</h2>
        </div>

        <div className="catresults-stats">
          {statsData.map((item, index) => (
            <div className="catresults-box" key={index}>
              <h3 className="catresults-number">{counts[index]}+</h3>
              <p className="catresults-label">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>


   <section className="tt-student-showcase-wrapper">
<div className="tt-student-cards-scroll">
  {students.map((student, idx) => (
    <div className="tt-student-card" key={idx}>
      <LazyImage src={student.image} alt={student.name} />
      <div className="tt-student-overlay">
        <div className="tt-overlay-content">
          <h4>{student.name}</h4>
          <p>{student.desc}</p>
          <span className="tt-read-more">Read More →</span>
        </div>
      </div>
      <div className="tt-student-name">{student.name}</div>
      <div className="tt-student-percentile">{student.percentile}</div>
    </div>
  ))}
</div>



<div className="tt-student-footer-row">
  <div className="tt-student-nav">
    <button className="tt-circle-btn">←</button>
    <div className="tt-dot active"></div>
    <button className="tt-circle-btn">→</button>
  </div>
  <button onClick={()=>navigate("/image-gallery")} className="tt-view-all">View all</button>
</div>
   </section>
</>
  );
};

export default ThirdPage;