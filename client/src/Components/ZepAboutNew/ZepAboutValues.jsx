import React, { useEffect } from 'react';

const ZepAboutValues = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepAboutValues-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepAboutValues-root" className="zep-about-page">
      <section className="values">
  <div className="values-header reveal">
    <h2>What We Stand <span>For</span></h2>
  </div>
  <div className="values-grid">
    <div className="value-card reveal">
      <div className="value-num">01</div>
      <div className="value-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div className="value-title">Integrity First</div>
      <div className="value-desc">We never charge job seekers. Transparency and trust are non-negotiable in every interaction with candidates, clients, and partners.</div>
    </div>
    <div className="value-card reveal">
      <div className="value-num">02</div>
      <div className="value-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
      <div className="value-title">AI-First Thinking</div>
      <div className="value-desc">We build intelligence into every layer — from sourcing and screening to assessment and delivery — so humans can focus on what matters most.</div>
    </div>
    <div className="value-card reveal">
      <div className="value-num">03</div>
      <div className="value-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
      <div className="value-title">People at the Core</div>
      <div className="value-desc">Behind every placement is a person with aspirations. We take that seriously — matching candidates to opportunities that genuinely align with their goals.</div>
    </div>
    <div className="value-card reveal">
      <div className="value-num">04</div>
      <div className="value-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
      <div className="value-title">Speed Without Compromise</div>
      <div className="value-desc">Fast doesn't mean careless. Our AI pipeline compresses timelines while maintaining rigorous quality — delivering decision-ready candidates, not warm bodies.</div>
    </div>
    <div className="value-card reveal">
      <div className="value-num">05</div>
      <div className="value-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div>
      <div className="value-title">Global Scale</div>
      <div className="value-desc">With offices in London and Hyderabad and a distributed recruiter network, we operate at the intersection of local expertise and global reach.</div>
    </div>
    <div className="value-card reveal">
      <div className="value-num">06</div>
      <div className="value-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
      <div className="value-title">Continuous Improvement</div>
      <div className="value-desc">Every placement improves our models. We use real outcomes — not just activity metrics — to get better at what we do with every hire delivered.</div>
    </div>
  </div>
</section>
    </div>
  );
};

export default ZepAboutValues;
