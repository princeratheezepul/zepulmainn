import React, { useEffect, useState, useRef } from 'react';
import './ZepJobs.css';

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


      {/* NAV */}
      <nav className={`nav ${scrolled ? "scrolled" : ""} ${hidden ? "hidden" : ""}`}>
        <a className="logo" href="#"><img src="logo.png" alt="Zepul" /></a>
        <div className="nav-links">
          <button className="nl">Zep Recruit</button>
          <button className="nl">Zep Pro Recruiter</button>
          <button className="nl active">Zep Jobs</button>
          <button className="nl">Zep Talent Hub</button>
          <button className="nl">About</button>
        </div>
        <div className="nav-right">
          <button className="nav-btn">
            Sign In
            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg>
          </button>
        </div>
      </nav>

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

      {/* BEYOND CTA */}
      <section className="beyond">
        <div className="beyond-left reveal">
          <div>
            <h2 className="section-head">Beyond recruitment, we architect talent <span className="blue">intelligently, consistently, and at scale.</span></h2>
            <p style={{ fontSize: "13px", lineHeight: "1.75", color: "rgba(255,255,255,.45)", marginTop: "16px", maxWidth: "400px" }}>
              Join forward-thinking enterprises that trust Zepul to transform how they discover, assess, and hire top talent.
            </p>
          </div>
          <div className="beyond-social">
            <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></a>
            <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></a>
          </div>
        </div>
        <div className="beyond-right reveal">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input type="text" placeholder="John Doe" /></div>
              <div className="form-group"><label>Work Email</label><input type="email" placeholder="john@company.com" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Company</label><input type="text" placeholder="Company name" /></div>
              <div className="form-group"><label>Hiring Volume</label><select><option>Select range</option><option>1—10 hires/month</option><option>11—50 hires/month</option><option>50+ hires/month</option></select></div>
            </div>
            <div className="form-group"><label>Message</label><textarea placeholder="Tell us about your hiring goals..."></textarea></div>
            <button type="submit" className="form-btn">
              Get Started
              <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg>
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER (FULL) */}
      <footer className="footer-full">
        <div className="footer-grid">

          {/* Brand col */}
          <div className="footer-brand">
            <a href="#" className="logo"><img src="logo.png" alt="Zepul" /></a>
            <p className="footer-brand-desc">Zepul™ and its partners, authorized vendors, and subsidiaries do not charge any fees from job seekers for employment placements. If anyone claims otherwise, please report such violations immediately.</p>
            <div className="footer-compliance">
              <span className="footer-compliance-badge">MSME / UDYAM</span>
              <span className="footer-compliance-badge">DPIIT</span>
              <span className="footer-compliance-badge">London Chamber</span>
            </div>
          </div>

          {/* Nav col */}
          <div>
            <div className="footer-col-title">Products</div>
            <div className="footer-col-links">
              <a href="#">Zep Recruit</a>
              <a href="#">Zep Pro Recruit</a>
              <a href="#">Zep Jobs</a>
              <a href="#">Zep Talent Hub</a>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          </div>

          {/* Legal col */}
          <div>
            <div className="footer-col-title">Legal</div>
            <div className="footer-col-links">
              <a href="#">Terms &amp; Conditions</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Blog</a>
            </div>
          </div>

          {/* Contact col */}
          <div>
            <div className="footer-col-title">Contact</div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <div className="footer-contact-text">support@zepul.com</div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .82h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
              </div>
              <div className="footer-contact-text">+91-77939 55555</div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <div className="footer-contact-text">
                <strong>Product HQ</strong>
                56 Weighton Road, Harrow, London, United Kingdom
              </div>
            </div>
            <div className="footer-contact-item">
              <div className="footer-contact-icon ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <div className="footer-contact-text">
                <strong>Services HQ</strong>
                Floor 6, 610/B Sandhya Techno 1, Khajaguda, Hyderabad, India
              </div>
            </div>
          </div>

        </div>{/* end footer-grid */}

        {/* Footer bottom bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span className="footer-copy">© 2026 Zepul. All rights reserved.</span>
            <div className="footer-violations">
              <strong>Report Violations</strong>
              info@zepul.com &nbsp;·&nbsp; legal@zepul.com
            </div>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></a>
            <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default ZepJobs;
