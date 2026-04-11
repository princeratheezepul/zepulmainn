import React, { useEffect } from 'react';

const ZepWhyChoose = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepWhyChoose-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepWhyChoose-root" className="zep-recruit-page">
      <section className="zrw-why">
  <div className="zrw-why-header reveal">
    <h2 className="section-head">Why Businesses<br /><span className="blue">Choose Zepul?</span></h2>
    <p className="section-sub">From outdated limitations to AI-powered solutions — here's how Zepul solves every hiring challenge.</p>
  </div>

  <div className="zrw-vs-head reveal">
    <div className="h-bad">Traditional Recruitment</div>
    <div className="h-mid"></div>
    <div className="h-good">Zepul AI Pipeline</div>
  </div>
  <div className="zrw-vs reveal">
    <div className="zrw-vs-card">
      <div className="zrw-vs-side bad">
        <div className="zrw-vs-icon bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">Before</span><span className="zrw-vs-text">Manual keyword searches &amp; limited databases</span></div>
      </div>
      <div className="zrw-vs-mid"><span className="zrw-vs-feature">Multi-Channel Sourcing</span><div className="zrw-vs-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div className="zrw-vs-side good">
        <div className="zrw-vs-icon good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">With Zepul</span><span className="zrw-vs-text">AI-powered discovery across job boards, databases &amp; partners</span></div>
      </div>
    </div>
    <div className="zrw-vs-card">
      <div className="zrw-vs-side bad">
        <div className="zrw-vs-icon bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">Before</span><span className="zrw-vs-text">Subjective human screening, prone to bias and delays</span></div>
      </div>
      <div className="zrw-vs-mid"><span className="zrw-vs-feature">AI CV Matching</span><div className="zrw-vs-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div className="zrw-vs-side good">
        <div className="zrw-vs-icon good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">With Zepul</span><span className="zrw-vs-text">Automated ranking with precision scoring</span></div>
      </div>
    </div>
    <div className="zrw-vs-card">
      <div className="zrw-vs-side bad">
        <div className="zrw-vs-icon bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">Before</span><span className="zrw-vs-text">Scattered notes and fragmented email chains</span></div>
      </div>
      <div className="zrw-vs-mid"><span className="zrw-vs-feature">Decision-Ready Data</span><div className="zrw-vs-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div className="zrw-vs-side good">
        <div className="zrw-vs-icon good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">With Zepul</span><span className="zrw-vs-text">Comprehensive Report Cards (CV, Code &amp; Interview ranks)</span></div>
      </div>
    </div>
    <div className="zrw-vs-card">
      <div className="zrw-vs-side bad">
        <div className="zrw-vs-icon bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">Before</span><span className="zrw-vs-text">Unstructured, inconsistent, and scheduling nightmares</span></div>
      </div>
      <div className="zrw-vs-mid"><span className="zrw-vs-feature">Bias-Free Interviews</span><div className="zrw-vs-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div className="zrw-vs-side good">
        <div className="zrw-vs-icon good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">With Zepul</span><span className="zrw-vs-text">100% AI-driven structured interviews with clear summaries</span></div>
      </div>
    </div>
    <div className="zrw-vs-card">
      <div className="zrw-vs-side bad">
        <div className="zrw-vs-icon bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">Before</span><span className="zrw-vs-text">Generic tests or heavy reliance on hiring managers</span></div>
      </div>
      <div className="zrw-vs-mid"><span className="zrw-vs-feature">Dynamic Assessments</span><div className="zrw-vs-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div className="zrw-vs-side good">
        <div className="zrw-vs-icon good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">With Zepul</span><span className="zrw-vs-text">Personalised coding &amp; technical tests generated per role</span></div>
      </div>
    </div>
    <div className="zrw-vs-card">
      <div className="zrw-vs-side bad">
        <div className="zrw-vs-icon bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">Before</span><span className="zrw-vs-text">Guesswork and opaque market rate matching</span></div>
      </div>
      <div className="zrw-vs-mid"><span className="zrw-vs-feature">Offer Intelligence</span><div className="zrw-vs-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div className="zrw-vs-side good">
        <div className="zrw-vs-icon good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">With Zepul</span><span className="zrw-vs-text">Detailed salary benchmarking &amp; dedicated negotiation</span></div>
      </div>
    </div>
    <div className="zrw-vs-card">
      <div className="zrw-vs-side bad">
        <div className="zrw-vs-icon bad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">Before</span><span className="zrw-vs-text">Bottlenecked by internal recruiter bandwidth</span></div>
      </div>
      <div className="zrw-vs-mid"><span className="zrw-vs-feature">Scalable Network</span><div className="zrw-vs-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div className="zrw-vs-side good">
        <div className="zrw-vs-icon good"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div className="zrw-vs-body"><span className="zrw-vs-label">With Zepul</span><span className="zrw-vs-text">Infinite scaling via AI + Global on-demand recruiter network</span></div>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default ZepWhyChoose;
