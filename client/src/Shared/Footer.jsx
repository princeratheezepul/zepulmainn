import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Main Footer Content */}
      <div className="footer-main">
        {/* Left Section - Logo and Disclaimer */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src="/assets/image.png" alt="ZEPUL" className="logo-img" />
          </div>
          <p className="footer-disclaimer">
            Zepul™ , it's partners, authorized vendors, and subsidiaries do not
            charge any fees from job seekers for employment placements. If
            anyone claims otherwise, please report such violations
            immediately.
          </p>
        </div>

        {/* Middle Section - Navigation Links */}
        <div className="footer-middle">
          <div className="footer-links-column">
            <Link to="/ZepRecruit" className="footer-link">Zep Recruit</Link>
            <Link to="/prorecruitor" className="footer-link">Zep Pro Recruiter</Link>
            <Link to="/careers" className="footer-link">Zep Jobs</Link>
            <Link to="/zepConsult" className="footer-link">Zep Consult</Link>
            <Link to="/about" className="footer-link">About</Link>
          </div>
          <div className="footer-links-column">
            <Link to="/terms" className="footer-link">Terms & Conditions</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/blog" className="footer-link">Blog</Link>
          </div>
        </div>

        {/* Right Section - Contact Info */}
        <div className="footer-right">
          <div className="contact-item">
            <MdEmail className="contact-icon" />
            <a href="mailto:info@zepul.com" className="contact-text">info@zepul.com</a>
          </div>
          <div className="contact-item">
            <MdPhone className="contact-icon" />
            <span className="contact-text">+91-77939 55555</span>
          </div>
          <div className="contact-item">
            <MdLocationOn className="contact-icon" />
            <div className="contact-text">
              <div className="address-label">Product HQ</div>
              <div className="address-text">56 Weighton Road, Harrow,</div>
              <div className="address-text">London, United Kingdom</div>
            </div>
          </div>
          <div className="contact-item">
            <MdLocationOn className="contact-icon" />
            <div className="contact-text">
              <div className="address-label">Services HQ</div>
              <div className="address-text">#401, Fourth Floor B - Block, Asian Sun City,</div>
              <div className="address-text">Kothaguda, Kondapur, Hyderabad</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Social, Report, Certifications */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          {/* Social Icons */}
          <div className="social-icons">
            <a
              href="https://www.instagram.com/tryzepul/"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
            >
              <IoLogoInstagram />
            </a>
            <a
              href="https://x.com/tryzepul?t=a7vaOJwbEV_EnDwn9tNiAg&s=08"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
            >
              <FaXTwitter />
            </a>
            <a
              href="https://www.linkedin.com/company/tryzepul/"
              target="_blank"
              rel="noreferrer"
              className="social-icon"
            >
              <FaLinkedin />
            </a>
          </div>

          {/* Report Violations */}
          <div className="report-section">
            <Link to="/report-violations" className="report-link">
              Report Violations
            </Link>
            <a href="mailto:support@zepul.com" className="support-email">
              Support@zepul.com
            </a>
            <a href="mailto:legal@zepul.com" className="support-email">
              legal@zepul.com
            </a>
          </div>
        </div>

        {/* Certifications and Logos */}
        <div className="footer-bottom-right">
          <div className="certification-item">
            <div className="cert-title">MSME / UDYAM</div>
            <div className="cert-subtitle">Recognized Startup</div>
            <div className="cert-number">Certificate # DIPP123320</div>
          </div>

          <div className="logo-group dpiit-group">
            <img src="/assets/DPIIT.png" alt="DPIIT" className="cert-logo dpiit-logo" />
            <div className="dpiit-text">
              <div className="dpiit-subtitle">Recognized Startup</div>
              <div className="dpiit-cert-number">Certificate # DIPP123320</div>
            </div>
          </div>

          <div className="logo-group">
            <img src="/assets/london-chamber.png" alt="London Chamber" className="cert-logo chamber-logo" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
