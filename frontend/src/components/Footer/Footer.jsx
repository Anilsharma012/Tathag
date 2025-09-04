import React from "react";
import "./Footer.css";
import { FaWhatsapp, FaInstagram, FaTelegramPlane, FaFacebookF, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import logo from "../../../src/images/logo 1.png";
import watermark from "../../../src/images/TG 1.png";

const Footer = () => {
  return (
    <footer className="tg-footer">
     

    

      <hr />

      <div className="tg-footer-bottom">
        <div className="tg-footer-brand">
          <img src={logo} alt="TathaGat Logo" />
          <div className="tg-footer-social">
            <FaWhatsapp />
            <FaInstagram />
            <FaTelegramPlane />
            <FaFacebookF />
          </div>
          <p>TathaGat © 2025. All rights reserved.</p>
        </div>

        <div className="tg-footer-links">
          <div>
            <h4>Courses (MBA)</h4>
            <ul>
              <li>CAT</li>
              <li>XAT</li>
              <li>GMAT</li>
              <li>NMAT</li>
              <li>SNAP</li>
              
            </ul>
          </div>
           <div>
            <h4>Courses (12th +)</h4>
            <ul>
              <li>IPMAT</li>
              <li>CUET</li>
              <li>BBA</li>
             
              
            </ul>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li>About Us</li>
              <li>Courses</li>
              <li>Testimonial</li>
              <li>Faculty</li>
              <li>Blog</li>
              <li>Contact Us</li>
            </ul>
          </div>
          
          <div>
            <h4>Get In Touch</h4>
            <p><FaMapMarkerAlt /> 106, 1st Floor, New Delhi<br />House Connaught Place,<br />New Delhi 110001</p>
            <p><FaPhoneAlt /> +91 9205534439</p>
            <p><FaEnvelope /> info@tathagat.co.in</p>
          </div>

        <div className="tg-footer-watermark">
        <img src={watermark} alt="TG Watermark" className="tg-watermark-img" />
        <p>Shaping futures for 18 years,<br /> excellence beyond comparison!</p>
        <h3>2007</h3>
      </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
