import { Link, useLocation } from "react-router-dom"; // ⬅️ useLocation add
import { Phone, Mail, Facebook, Instagram, Youtube, Menu, X } from "lucide-react";
import { useState, useEffect } from "react"; // ⬅️ useEffect add
import "./Header.css";
import logo from "../../images/tgLOGO.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();                     // ⬅️ added
  const closeMenu = () => setIsMobileMenuOpen(false); // ⬅️ added

  // Route change par hamesha menu band rahe
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="header-wrapper">
      {/* Top Contact Bar */}
      <div className="top-contact-bar">
        <div className="top-bar-container">
          <div className="contact-left">
            <div className="contact-item">
              <Phone className="contact-icon" />
              <span>9205534439</span>
            </div>
            <div className="contact-separator">|</div>
            <div className="contact-item">
              <Mail className="contact-icon" />
              <span>info@tathagat.co.in</span>
            </div>
          </div>

          <div className="social-icons-center">
            <Link to="/success-stories">
              <div className="icon-circle instagram-bg">
                <Instagram className="social-icon-white" />
              </div>
            </Link>
            <Link to="/course-purchase">
              <div className="icon-circle youtube-bg">
                <Youtube className="social-icon-white" />
              </div>
            </Link>
            <Link to="/faq">
              <div className="icon-circle facebook-bg">
                <Facebook className="social-icon-white" />
              </div>
            </Link>
            {/* <Link to="/faq">
              <div className="icon-circle facebook-bg">
                <Telegram className="social-icon-white" />
              </div>
            </Link> */}
          </div>

          {/*           
          <div className="social-icons-center">
            <Link to="/faq">
              <Facebook className="social-icon-facebook" />
            </Link>
            <Link to="/success-stories">
              <Instagram className="social-icon-instagram" />
            </Link>
            <Link to="/course-purchase">
              <Youtube className="social-icon-youtube" />
            </Link>
            <Link to="/faq">
              <div className="custom-social-icon"></div>
            </Link>
          </div> */}

          <div className="download-right">
            <Link to="/Testimonial" className="download-link">Download CAT Syllabus & Strategy</Link>
            {/* <Link to="/resource" className="download-link">Download VARC Cheat Sheet</Link> */}
            <Link to="/AboutUs" className="download-link">Download CAT Quant Formula PDF</Link>
            <Link to="/Tips" className="download-link">Free CAT Study Material</Link>
            <Link to="/cat" className="download-link">Download CAT Quant Formula PDF</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="main-navigation">
        <div className="nav-container">
          <div className="nav-content">
            {/* Logo */}
            <Link to="/" className="logo-link">
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt="TathaCat Logo"
                  className="logo-img"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <Link to="/course-details" className="nav-link dropdown">
                <span>Courses</span>
                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              <Link to="/score-card" className="nav-link dropdown">
                <span>Results</span>
                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              <Link to="/team" className="nav-link">Faculty</Link>
              
              <Link to="/resource" className="nav-link dropdown">
                <span>Resources</span>
                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              <Link to="/mock-test" className="nav-link dropdown">
                <span>Downloads</span>
                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              
              <Link to="/GetInTouch" className="nav-link">Contact</Link>
              
              <Link to="/ourBlog" className="nav-link">Blogs</Link>
            </nav>

            {/* Right Side Buttons */}
            <div className="nav-actions">
              <Link to="/student/dashboard">
                <button className="btn-white">
                  Student LMS
                </button>
              </Link>
              <Link to="/image-gallery">
                <button className="btn-white">
                  Join Us Today
                </button>
              </Link>
              <Link to="/Login" className="login-link">
                <button className="btn-orange">
                  Log In
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="mobile-menu">
              <nav className="mobile-nav">
                <Link to="/course-details" className="mobile-link" onClick={closeMenu}>Courses</Link>
                <Link to="/score-card" className="mobile-link" onClick={closeMenu}>Results</Link>
                <Link to="/team" className="mobile-link" onClick={closeMenu}>Faculty</Link>
                <Link to="/resource" className="mobile-link" onClick={closeMenu}>Resources</Link>
                <Link to="/mock-test" className="mobile-link" onClick={closeMenu}>Downloads</Link>
                <Link to="/GetInTouch" className="mobile-link" onClick={closeMenu}>Contact</Link>
                <Link to="/ourBlog" className="mobile-link" onClick={closeMenu}>Blogs</Link>
                <div className="mobile-actions">
                  <Link to="/student/dashboard" onClick={closeMenu}>
                    <button className="mobile-btn-white">
                      Student LMS
                    </button>
                  </Link>
                  <Link to="/image-gallery" onClick={closeMenu}>
                    <button className="mobile-btn-orange">
                      Join Us Today
                    </button>
                  </Link>
                  <Link to="/Login" className="mobile-login" onClick={closeMenu}>Log In</Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

