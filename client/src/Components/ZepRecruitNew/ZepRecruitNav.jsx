import React, { useEffect } from 'react';

const ZepRecruitNav = () => {

  useEffect(() => {
    const nav = document.querySelector('#ZepRecruitNav-root .nav');
    if (!nav) return;
    let lastY = 0, ticking = false;
    function onScroll() {
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 20) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
        if (y > lastY + 8 && y > 120) nav.classList.add('hidden');
        else if (y < lastY - 8) nav.classList.remove('hidden');
        lastY = y; ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div id="ZepRecruitNav-root" className="zep-recruit-page">
      <nav className="nav">
  <a className="logo" href="zepul-hero-v7_1.html">
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="18" height="6" rx="1" fill="#024BFF"/>
      <polygon points="18,6 18,12 0,16 0,10" fill="#024BFF"/>
      <rect x="0" y="16" width="18" height="6" rx="1" fill="#024BFF"/>
    </svg>
    <span className="logo-word">ZEPUL</span><sup className="logo-tm">™</sup>
  </a>
  <div className="nav-links">
    <a className="nl active" href="zep-recruit.html">Zep Recruit</a>
    <a className="nl" href="zep-prorecruiter.html">Zep Pro Recruiter</a>
    <a className="nl" href="zep-jobs.html">Zep Jobs</a>
    <a className="nl" href="zep-pricing.html">Pricing</a>
    <a className="nl" href="zepul-about.html">About</a>
  </div>
  <div className="nav-right">
    <button className="nav-btn">
      Sign In
      <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3"/></svg>
    </button>
  </div>
<button className="hamburger" id="hamburgerBtn" aria-label="Menu"><span></span><span></span><span></span></button></nav>
    </div>
  );
};

export default ZepRecruitNav;
