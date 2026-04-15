import React, { useEffect } from 'react';

const ZepAboutMission = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepAboutMission-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  useEffect(() => { const io = new IntersectionObserver(entries=>{ entries.forEach(({isIntersecting,target:el})=>{ if(!isIntersecting) return; const end=+el.dataset.target, sfx=el.dataset.suffix||''; let s=null; const run=ts=>{ if(!s)s=ts; const p=Math.min((ts-s)/1200,1); el.textContent=Math.round((1-(1-p)**3)*end)+sfx; if(p<1)requestAnimationFrame(run); }; requestAnimationFrame(run); io.unobserve(el); }); },{threshold:.5}); const rootNode=document.getElementById('ZepAboutMission-root'); if(rootNode) rootNode.querySelectorAll('.counter').forEach(el=>io.observe(el)); return ()=>io.disconnect(); }, []);
  return (
    <div id="ZepAboutMission-root" className="zep-about-page">
      <section className="mission">
  <div className="mission-header reveal">
    <div className="section-label">Our Mission</div>
    <h2>Partnered with most of the <em>top people at each industry</em></h2>
    <p>Zepul is an AI-powered recruitment platform that re-engineers how companies discover, screen, and hire talent. We combine inhouse expertise with a global recruiter network, delivering superior quality while reducing cost, time, and complexity.</p>
  </div>
  <div className="mission-cards reveal">
    <div className="mission-card">
      <div className="mission-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
      <div className="mission-card-num"><span className="counter" data-target="400" data-suffix="K+">400K+</span></div>
      <div className="mission-card-label">Active Talent Pool</div>
    </div>
    <div className="mission-card">
      <div className="mission-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
      <div className="mission-card-num"><span className="counter" data-target="150" data-suffix="+">150+</span></div>
      <div className="mission-card-label">Global Recruiters</div>
    </div>
    <div className="mission-card">
      <div className="mission-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div className="mission-card-num"><span className="counter" data-target="5000" data-suffix="+">5000+</span></div>
      <div className="mission-card-label">Successful Placements</div>
    </div>
    <div className="mission-card">
      <div className="mission-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
      <div className="mission-card-num"><span className="counter" data-target="45" data-suffix="%">45%</span></div>
      <div className="mission-card-label">Cost Reduction</div>
    </div>
  </div>
</section>
    </div>
  );
};

export default ZepAboutMission;
