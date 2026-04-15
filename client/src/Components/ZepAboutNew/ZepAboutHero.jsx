import React, { useEffect } from 'react';
import ZepAboutGlobe from './ZepAboutGlobe';

const ZepAboutHero = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepAboutHero-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);

  return (
    <div id="ZepAboutHero-root" className="zep-about-page">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-word">About</div>
          {/* <p className="hero-desc">Reimagining recruitment with AI — from traditional success-based hiring to a fully integrated RaaS, RPO and Retainer model — reducing cost, time, and complexity for the world's best teams.</p> */}
        </div>

        {/* Interactive COBE Globe */}
        <div className="hero-globe">
          <ZepAboutGlobe />
        </div>
      </section>
    </div>
  );
};

export default ZepAboutHero;
