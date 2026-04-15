import React, { useEffect } from 'react';

const ZepProFeatures = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepProFeatures-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepProFeatures-root" className="zep-pro-recruiter-page">
      <section className="zrw-features">
  <div className="zrw-features-header reveal">
    <h2 className="section-head">What Zep Pro Recruiter<br /><span className="blue">Delivers For You</span></h2>
  </div>
  <div className="zrw-feature-grid">
    {/*  1  */}
    <div className="zrw-feature-card reveal">
      <div className="zrw-feature-num">01</div>
      <div className="zrw-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div className="zrw-feature-title">Pay &amp; Start Using</div>
      <div className="zrw-feature-desc">Get started with a single click and access a unified talent acquisition suite that manages everything under one roof — from requisition to onboarding, without switching between multiple tools.</div>
    </div>
    {/*  2  */}
    <div className="zrw-feature-card reveal">
      <div className="zrw-feature-num">02</div>
      <div className="zrw-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>
      <div className="zrw-feature-title">Source &amp; Assess</div>
      <div className="zrw-feature-desc">AI-driven multi-channel predictive and proactive sourcing to build a strong, qualified talent data pipeline.</div>
    </div>
    {/*  3  */}
    <div className="zrw-feature-card reveal">
      <div className="zrw-feature-num">03</div>
      <div className="zrw-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg></div>
      <div className="zrw-feature-title">Screen &amp; Shortlist</div>
      <div className="zrw-feature-desc">AI reads, ranks and matches JVs vs talent. Customised coding tests. Optional 100% AI or human interviews to create precision shortlists.</div>
    </div>
    {/*  4  */}
    <div className="zrw-feature-card reveal">
      <div className="zrw-feature-num">04</div>
      <div className="zrw-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
      <div className="zrw-feature-title">Comprehensive Report Cards</div>
      <div className="zrw-feature-desc">Decision-Ready Candidate Report: CV Strength, Talent Rank, Coding Performance, Interview Summary &amp; Complete Profile — all in one unified summary.</div>
    </div>
    {/*  5  */}
    <div className="zrw-feature-card reveal">
      <div className="zrw-feature-num">05</div>
      <div className="zrw-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
      <div className="zrw-feature-title">Account &amp; Interview Mgmt</div>
      <div className="zrw-feature-desc">Dedicated account manager to engage with TA and delivery. Report cards submitted and constant engagement for calibration and seamless experience.</div>
    </div>
    {/*  6  */}
    <div className="zrw-feature-card reveal">
      <div className="zrw-feature-num">06</div>
      <div className="zrw-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
      <div className="zrw-feature-title">Optimize &amp; Govern</div>
      <div className="zrw-feature-desc">Real-time dashboards with performance tracking and market + talent insights for continuous improvement and strategic adjustments.</div>
    </div>
  </div>
</section>
    </div>
  );
};

export default ZepProFeatures;
