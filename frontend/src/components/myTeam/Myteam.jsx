import React from "react";
import "./Myteam.css";
import { useNavigate } from "react-router-dom";


import team1 from "../../images/Team/Rajat 5.png"
import team2 from "../../images/Team/KumarSir.png"
import team3 from "../../images/Team/Niraj-Sir.png"

import team5 from "../../images/Team/Lydia.png"
import team6 from "../../images/Team/Sandeep.png"
import team7 from "../../images/Team/Sneha-Malik.png"
import team8 from "../../images/Team/Azhar.png"
import team9 from "../../images/Team/Kishan.png"




const mentors = [
  {
    name: "Rajat Kumar",
    role: "Founder & CEO",
     expertise: "Expts - Quant/LRDI",
    img: team1,
  },
  {
    name: "Kumar Abhishek",
    role: " CMO & CO-Founder",
      expertise: "Expts - Quant/LRDI",
    img:  team2,
  },
  {
    name: "Neeraj Naiyar",
    role: "Founder & CEO",
      expertise: "Expts - Quant/LRDI",
    img:  team3,
  },
  // {
  //   name: "Lydia",
  //   role: "Lead, Student Relations",
  //   img:  team4,
  // },
  {
    name: "Lydia",
    role: "Head-Student Relation",
    img:  team5,
  },
   {
     name: "Kishan Bhardwaj",
     role: "Quant Faculty",
     img:  team9,
   }
  ,
  //   {
  //   name: "Manish Yadav",
  //   role: "Guest Faculty",
  //   img:  team6,
  // },
  {
    name: "Sneha Malik",
    role: "Student Relation",
    img:  team7,
  },
  {
    name: "Azhar Ansari",
    role: "Quant Faculty",
    img:  team8,
  },
];

const Myteam = () => {
    const navigate = useNavigate();
  return (
    <section className="teachersection">
      <div className="teacher-container">
        {/* Header */}
        <div className="teacher-header">
          <div className="teacher-left">
            <p className="teacher-eyebrow">MEET OUR MENTORS</p>
            <h2 className="teacher-title">
              Guiding students with
              <br /> passion, and proven results.
            </h2>
          </div>

          <div className="teacher-right">
            <p className="teacher-subtext">
              Our team at TathaGat brings unmatched experience and dedication.
              With proven strategies, personal guidance, and passion for
              teaching, we help students excel in CAT and other management
              entrance exams.
            </p>
               <button
              className="teacher-cta"
              type="button"
              onClick={() => navigate("/team")}
            >
              View All
            </button>
          </div>
        </div>

        {/* Cards (Horizontal scroll) */}
        {/* <div className="teacher-cards-scroll">
          {mentors.map((m, i) => (
            <article className="teacher-card" key={i}>
              <div className="teacher-card-imgWrap">
                <img src={m.img} alt={m.name} className="teacher-card-img" />
              </div>
              <div className="teacher-card-info">
                <h3 className="teacher-card-name">{m.name}</h3>
                <p className="teacher-card-role">{m.role}</p>
              </div>
            </article>
          ))}
        </div> */}


        <div className="teacher-cards-scroll">
  {mentors.map((m, i) => (
    <article className="teacher-card" key={i}>
      <div className="teacher-card-imgWrap">
        <img src={m.img} alt={m.name} className="teacher-card-img" />
      </div>
      <div className="teacher-card-info">
        <h3 className="teacher-card-name">{m.name}</h3>
        <p className="teacher-card-role">{m.role}</p>
        {m.expertise && <p className="teacher-card-expertise">{m.expertise}</p>}
      </div>
    </article>
  ))}
</div>
      </div>
    </section>
  );
};

export default Myteam;
