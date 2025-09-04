import React, { useState } from "react";
import "./SixthPage.css";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import FAQ from "../../FAQ/FAQ";
import Mycourse from "../../MyCourses/Mycourse";

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
/>;
const SixthPage = () => {

return (
    <>
   
<Mycourse/>


      <div className="free-session-banner">
        <div className="free-content-box">
          <h2>
            Join our Free <br /> Session!
          </h2>
          <button>Talk to Our Student Counsellors</button>
        </div>
      </div>

   <FAQ/>
    </>
  );
};

export default SixthPage;
