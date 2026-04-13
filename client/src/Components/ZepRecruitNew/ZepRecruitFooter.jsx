import React, { useEffect } from 'react';

const ZepRecruitFooter = () => {

  return (
    <div id="ZepRecruitFooter-root" className="zep-recruit-page">
      <footer className="site-footer">
        <div className="site-footer-main">
          <div>
            <a className="logo" href="zepul-hero-v7_1.html">
              <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="18" height="6" rx="1" fill="#024BFF" />
                <polygon points="18,6 18,12 0,16 0,10" fill="#024BFF" />
                <rect x="0" y="16" width="18" height="6" rx="1" fill="#024BFF" />
              </svg>
              <span className="logo-word">ZEPUL</span><sup className="logo-tm">™</sup>
            </a>
            <p className="sf-disclaimer">*Zepul™ and its partners, authorized vendors, and subsidiaries do not charge any fees from job seekers for employment placements. If anyone claims otherwise, please report such violations immediately.</p>
          </div>
          <div>
            <div className="sf-col-head">Company</div>
            <div className="sf-links">
              <a href="zep-recruit.html">Zep Recruit</a>
              <a href="zep-prorecruiter.html">Zep Pro Recruiter</a>
              <a href="/zepJobs">Zep Jobs</a>
              <a href="/">Zep Talent Hub</a>
              <a href="zepul-about.html">About</a>
              <a href="/">Contact</a>
            </div>
          </div>
          <div>
            <div className="sf-col-head">Legal</div>
            <div className="sf-links">
              <a href="/">Terms &amp; Conditions</a>
              <a href="/">Privacy Policy</a>
              <a href="/">Blog</a>
            </div>
          </div>
          <div>
            <div className="sf-col-head">Contact</div>
            <div className="sf-contact-row">
              <span className="sf-contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></span>
              <span className="sf-contact-text">support@zepul.com</span>
            </div>
            <div className="sf-contact-row">
              <span className="sf-contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" /></svg></span>
              <span className="sf-contact-text">+91-77939 55555</span>
            </div>
            <div className="sf-contact-row">
              <span className="sf-contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg></span>
              <span className="sf-contact-text"><strong>Product HQ</strong>56 Weighton Road, Harrow,<br />London, United Kingdom</span>
            </div>
            <div className="sf-contact-row">
              <span className="sf-contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg></span>
              <span className="sf-contact-text"><strong>Services HQ</strong>Floor 6, 610/B Sandhya Techno 1,<br />Khajaguda, Hyderabad, India</span>
            </div>
          </div>
        </div>
        <div className="site-footer-bar">
          <div className="sf-bar-left">
            <div className="sf-social">
              <a href="/" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></a>
              <a href="/" aria-label="Twitter/X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
            </div>
            <div className="sf-violations">Report Violations: <a href="mailto:info@zepul.com">info@zepul.com</a> · <a href="mailto:legal@zepul.com">legal@zepul.com</a></div>
          </div>
          <div className="sf-bar-right">
            <span className="sf-badge">MSME / UDYAM</span>
            <span className="sf-badge">Internalngo</span>
            <span className="sf-badge">London Chamber</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ZepRecruitFooter;
