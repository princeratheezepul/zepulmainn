import React, { useEffect, useState, useRef } from 'react';
import './ZepJobs.css';
import LandingBeyondCTA from '../Components/landing/LandingBeyondCTA';
import LandingNav from '../Components/landing/LandingNav';
import '../styles/LandingPage.css';

const ZepJobs = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const lastY = useRef(0);
  const tickerWords = ['Product Design', 'Remote Jobs', 'AI Matching', 'Full Time', 'UX Research', 'Engineering Roles', 'Marketing Jobs', 'Zepul AI', 'Hyderabad', 'Bangalore'];
  const tickerArray = [...tickerWords, ...tickerWords];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 20) setScrolled(true);
      else setScrolled(false);

      if (y > lastY.current + 8 && y > 120) setHidden(true);
      else if (y < lastY.current - 8) setHidden(false);

      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => revealObserver.observe(el));

    return () => elements.forEach(el => revealObserver.unobserve(el));
  }, []);

  useEffect(() => {
    // Filter pills interaction
    const pills = document.querySelectorAll('.filter-pill');
    const onPillClick = (e) => {
      pills.forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
    };
    pills.forEach(pill => pill.addEventListener('click', onPillClick));

    // Job card interaction
    const cards = document.querySelectorAll('.job-card');
    const onCardClick = (e) => {
      cards.forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
    };
    cards.forEach(card => card.addEventListener('click', onCardClick));

    return () => {
      pills.forEach(pill => pill.removeEventListener('click', onPillClick));
      cards.forEach(card => card.removeEventListener('click', onCardClick));
    }
  }, []);

  return (
    <div className="zep-jobs-page">

      <LandingNav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-pre">
            <div className="hero-pre-line"></div>
            <span className="hero-pre-text">Powered by Zepul AI</span>
          </div>

          <h1 className="hero-h1">
            Find The Role<br />You Want,<br />
            <span className="blue">With Zepul Jobs.</span>
          </h1>

          <p className="hero-desc">Search for your desired jobs here. Zepul helps you discover opportunities, prepares you for interviews, and connects you directly with hiring managers — all powered by AI.</p>

          {/* Search box */}
          <div className="search-box">
            <label className="search-label">Describe your dream job</label>
            <textarea className="search-textarea" placeholder="Senior Product Designer At An Early-Stage Startup..."></textarea>
            <div className="search-actions">
              <button className="search-btn dark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                Hiring? Meet Zepul Jobs
              </button>
              <button className="search-btn blue-btn">
                Talk to Zepul
                <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg>
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="trust-badges">
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              See jobs in 10 minutes
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Free
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              You control what gets shared
            </div>
          </div>
        </div>

        {/* Hero right: mini job card previews */}
        <div className="hero-right">
          <div className="hero-right-label">Trending Roles Right Now</div>

          <div className="hero-job-preview featured">
            <div className="hjp-top">
              <div>
                <div className="hjp-title">Senior Product Designer</div>
                <div className="hjp-desc">Craft clean, user-friendly digital experiences with product and engineering teams.</div>
              </div>
              <span className="hjp-badge green">New</span>
            </div>
            <div className="hjp-meta">
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>Remote · Hyderabad</div>
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>Full time</div>
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>Posted May 15, 2025</div>
            </div>
          </div>

          <div className="hero-job-preview">
            <div className="hjp-top">
              <div>
                <div className="hjp-title">AI/ML Engineer</div>
                <div className="hjp-desc">Build and deploy machine learning models at scale for a fast-growing B2B SaaS platform.</div>
              </div>
              <span className="hjp-badge">Featured</span>
            </div>
            <div className="hjp-meta">
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>Bangalore · Hybrid</div>
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>Full time</div>
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>Posted May 12, 2025</div>
            </div>
          </div>

          <div className="hero-job-preview">
            <div className="hjp-top">
              <div>
                <div className="hjp-title">Growth Marketing Manager</div>
                <div className="hjp-desc">Drive pipeline and revenue growth across digital and performance marketing channels.</div>
              </div>
              <span className="hjp-badge">Hot</span>
            </div>
            <div className="hjp-meta">
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>Mumbai · Remote</div>
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>Full time</div>
              <div className="hjp-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>Posted May 10, 2025</div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track" id="tk">
          {tickerArray.map((w, i) => (
            <span key={i} className="ti"><span className="ts">+</span>{w}</span>
          ))}
        </div>
      </div>

      {/* AVAILABLE JOBS */}
      <section className="jobs">
        <div className="jobs-header reveal">
          <h2 className="jobs-title">Available Jobs</h2>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>Showing <strong style={{ color: "var(--ink)" }}>24</strong> open roles</span>
        </div>

        {/* Filters */}
        <div className="jobs-filters reveal">
          <button className="filter-pill active">All Roles <span className="filter-count">24</span></button>
          <button className="filter-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            Remote
          </button>
          <button className="filter-pill">Design</button>
          <button className="filter-pill">Engineering</button>
          <button className="filter-pill">Product</button>
          <button className="filter-pill">Marketing</button>
          <button className="filter-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            Full time
          </button>
        </div>

        {/* Job list */}
        <div className="job-list reveal">

          {/* Card 1 */}
          <div className="job-card active">
            <div className="jc-inner">
              <div className="jc-logo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="2" y="18" font-family="Arial" font-size="14" font-weight="700" fill="#4285F4">G</text>
                </svg>
              </div>
              <div className="jc-body">
                <div className="jc-title-row">
                  <span className="jc-title">Product Designer</span>
                  <span className="jc-badge featured">Featured</span>
                </div>
                <p className="jc-desc">We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 2+ years of experience in product or UX/UI design preferred.</p>
                <div className="jc-meta">
                  <div className="jc-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0112 0v1" /></svg>
                    <span className="jc-company-name">Google</span>
                  </div>
                  <div className="jc-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Remote · Hyderabad
                  </div>
                  <div className="jc-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                    Full time
                  </div>
                  <div className="jc-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Posted May 15, 2025
                  </div>
                </div>
              </div>
              <div className="jc-action">
                <button className="save-btn" title="Save job">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                </button>
                <button className="apply-btn">
                  Apply Now
                  <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="job-card">
            <div className="jc-inner">
              <div className="jc-logo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="2" y="18" font-family="Arial" font-size="14" font-weight="700" fill="#4285F4">G</text>
                </svg>
              </div>
              <div className="jc-body">
                <div className="jc-title-row">
                  <span className="jc-title">Senior UX Researcher</span>
                  <span className="jc-badge new">New</span>
                </div>
                <p className="jc-desc">Drive qualitative and quantitative research to uncover user insights. You'll partner with design, product, and engineering teams to translate research into actionable product decisions.</p>
                <div className="jc-meta">
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0112 0v1" /></svg><span className="jc-company-name">Google</span></div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>Remote · Hyderabad</div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>Full time</div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>Posted May 15, 2025</div>
                </div>
              </div>
              <div className="jc-action">
                <button className="save-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg></button>
                <button className="apply-btn">Apply Now <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg></button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="job-card">
            <div className="jc-inner">
              <div className="jc-logo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="2" y="18" font-family="Arial" font-size="14" font-weight="700" fill="#4285F4">G</text>
                </svg>
              </div>
              <div className="jc-body">
                <div className="jc-title-row">
                  <span className="jc-title">Product Designer</span>
                </div>
                <p className="jc-desc">We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 2+ years of experience in product or UX/UI design preferred.</p>
                <div className="jc-meta">
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0112 0v1" /></svg><span className="jc-company-name">Google</span></div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>Remote · Hyderabad</div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>Full time</div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>Posted May 15, 2025</div>
                </div>
              </div>
              <div className="jc-action">
                <button className="save-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg></button>
                <button className="apply-btn">Apply Now <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg></button>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="job-card">
            <div className="jc-inner">
              <div className="jc-logo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="2" y="18" font-family="Arial" font-size="14" font-weight="700" fill="#4285F4">G</text>
                </svg>
              </div>
              <div className="jc-body">
                <div className="jc-title-row">
                  <span className="jc-title">Design Systems Lead</span>
                </div>
                <p className="jc-desc">Own and evolve the company's design system. Collaborate cross-functionally to build scalable, accessible components and documentation that empower product teams.</p>
                <div className="jc-meta">
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0112 0v1" /></svg><span className="jc-company-name">Google</span></div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>Remote · Hyderabad</div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>Full time</div>
                  <div className="jc-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>Posted May 15, 2025</div>
                </div>
              </div>
              <div className="jc-action">
                <button className="save-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg></button>
                <button className="apply-btn">Apply Now <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg></button>
              </div>
            </div>
          </div>

        </div>{/* end job-list */}

        <div className="jobs-more reveal">
          <button className="jobs-more-btn">
            View All 24 Roles
            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg>
          </button>
        </div>
      </section>

      <LandingBeyondCTA />





    </div>
  );
};

export default ZepJobs;
