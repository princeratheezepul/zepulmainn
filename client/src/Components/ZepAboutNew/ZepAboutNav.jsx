import React, { useEffect } from 'react';

const ZepAboutNav = () => {

  useEffect(() => {
    const nav = document.querySelector('#ZepAboutNav-root .nav');
    if (!nav) return;
    let lastY = 0, ticking = false;
    function onScroll() {
      if (ticking) return;
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
    <div id="ZepAboutNav-root" className="zep-about-page">
      <nav className="nav">
        <a className="logo" href="/"><img src="/assets/logo.png" alt="Zepul" /></a>
        <div className="nav-links">
          <button className="nl">Zep Recruit</button>
          <button className="nl">Zep Pro Recruiter</button>
          <button className="nl">Zep Jobs</button>
          <button className="nl">Zep Talent Hub</button>
          <button className="nl active">About</button>
        </div>
        <div className="nav-right">
          <button className="nav-btn">Sign In</button>
        </div>
      </nav>
    </div>
  );
};

export default ZepAboutNav;
