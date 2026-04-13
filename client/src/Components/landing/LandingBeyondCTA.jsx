import React, { useEffect } from 'react';
import '../../styles/LandingPage.css';

const LandingBeyondCTA = () => {
  const handleSubmit = (e) => e.preventDefault();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lp-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    const elements = document.querySelectorAll('.lp-beyond .lp-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="lp-beyond" id="beyond-cta">
      <div className="lp-beyond-left lp-reveal">
        <div>
          <h2 className="lp-section-head">Beyond recruitment, we architect talent <span className="lp-blue"><br />intelligently, consistently,<br />and at scale.</span></h2>
          <p style={{ fontSize: '15px', lineHeight: '1.75', color: '#ffffff', marginTop: '20px', maxWidth: '420px', fontWeight: '500' }}>
            Join forward-thinking enterprises that trust Zepul to transform how they discover, assess, and hire top talent.
          </p>
          <button
            className="lp-form-btn"
            style={{ marginTop: '24px', width: 'fit-content', padding: '14px 40px' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Get Started
            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5.5h7M6 2.5l3 3-3 3" />
            </svg>
          </button>
        </div>
        <div className="lp-beyond-social" style={{ marginTop: '24px' }}>
          <a href="https://www.linkedin.com/company/zepul" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </a>
        </div>
      </div>

      <div className="lp-beyond-right lp-reveal">
        <form onSubmit={handleSubmit}>
          <div className="lp-form-row">
            <div className="lp-form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
            <div className="lp-form-group">
              <label>Work Email</label>
              <input type="email" placeholder="john@company.com" />
            </div>
          </div>
          <div className="lp-form-row">
            <div className="lp-form-group">
              <label>Company</label>
              <input type="text" placeholder="Company name" />
            </div>
            <div className="lp-form-group">
              <label>Hiring Volume</label>
              <select>
                <option>Select range</option>
                <option>1—10 hires/month</option>
                <option>11—50 hires/month</option>
                <option>50+ hires/month</option>
              </select>
            </div>
          </div>
          <div className="lp-form-group">
            <label>Message</label>
            <textarea placeholder="Tell us about your hiring goals..."></textarea>
          </div>
          <button type="submit" className="lp-form-btn">
            Get Started
            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5.5h7M6 2.5l3 3-3 3" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
};

export default LandingBeyondCTA;
