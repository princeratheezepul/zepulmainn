import React, { useEffect } from 'react';

const ZepProPipeline = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepProPipeline-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepProPipeline-root" className="zep-pro-recruiter-page">
      <section className="zrw">
  <div className="zrw-header reveal">
    <h2 className="section-head">How <span className="blue">Zep Pro Recruiter</span> Works</h2>
    <p className="section-sub">One platform. Endless possibilities. From requisition to onboarding, Zepul brings the entire talent acquisition lifecycle under one roof — multichannel sourcing, AI-driven screening and interviews, integrated coding assessments, and decision-ready talent scorecards supported by performance insights, market intelligence, and hundreds of recruitment partners worldwide.</p>
  </div>

  {/*  Agile & Lean bar  */}
  <div className="zrw-agile-bar reveal">
    <span className="zrw-agile-arrows">&raquo;</span>
    <span className="zrw-agile-text">Agile &amp; Lean Methodologies</span>
    <span className="zrw-agile-arrows">&raquo;</span>
  </div>

  <div className="zrw-canvas reveal">

    {/*  1. ENGAGEMENT MODELS  */}
    <div className="zrw-offerings" style={{width: '200px'}}>
      <div className="zrw-offerings-tag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Offerings
      </div>
      <div className="zrw-offerings-title">Engagement Models</div>
      <div className="zrw-offering-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>Single Contract</div>
      <div className="zrw-offering-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>Retention</div>
      <div className="zrw-offering-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Globalised</div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  2. ZEPDB  */}
    <div className="zrw-zepdb" style={{animation: 'nodeGlow 3s ease-in-out 1s infinite'}}>
      <div className="zrw-zepdb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
      <div><div className="zrw-zepdb-label">ZepDB</div><div className="zrw-zepdb-sub">Unified Data Layer</div></div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  3. SOURCING + services branch  */}
    <div className="zrw-col">
      <div className="zrw-node">
        <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>
        <div className="zrw-node-label">AI-Powered<br />Multi-Channel<br />Sourcing</div>
        <div className="zrw-node-sub">Database Discovery</div>
      </div>
      <div className="zrw-services-branch">
        <div className="zrw-services-branch-title">Services Layer</div>
        <div className="zrw-services-stack">
          <div className="zrw-ext-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>Candidate Upskilling</div>
          <div className="zrw-ext-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>On-Demand IT Consulting</div>
          <div className="zrw-ext-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Talent &amp; Market Insights</div>
          <div className="zrw-ext-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Performance Management</div>
        </div>
      </div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  4. CV MATCH  */}
    <div className="zrw-cv-group">
      <div className="zrw-cv-group-title">CV Match</div>
      <div className="zrw-cv-row">
        <div className="zrw-cv-node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg><div className="zrw-cv-node-label">Read</div></div>
        <div className="zrw-cv-node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg><div className="zrw-cv-node-label">Rank</div></div>
        <div className="zrw-cv-node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div className="zrw-cv-node-label">Match</div></div>
      </div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  5. CODING TEST  */}
    <div className="zrw-node">
      <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>
      <div className="zrw-node-label">AI-Driven<br />Personalised<br />Coding Test</div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  6. INTERVIEW WITH AI  */}
    <div className="zrw-node">
      <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
      <div className="zrw-node-label">Interview<br />with AI</div>
      <div className="zrw-node-sub">100% Automated</div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  7. AI PERSPECTIVE + HUMAN VALIDATION  */}
    <div className="zrw-split">
      <div className="zrw-node" style={{maxWidth: 'none', minWidth: '130px'}}>
        <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <div className="zrw-node-label">AI Perspective</div>
        <div className="zrw-node-sub">Automated Analysis</div>
      </div>
      <div className="zrw-node" style={{maxWidth: 'none', minWidth: '130px'}}>
        <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div className="zrw-node-label">Human Validation</div>
        <div className="zrw-node-sub">Expert Review</div>
      </div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  8. REPORT CARD  */}
    <div className="zrw-report" style={{maxWidth: '200px', flexDirection: 'column', textAlign: 'center', alignItems: 'center'}}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      <div>
        <div className="zrw-report-text">Decision-Ready Report Card</div>
        <div className="zrw-report-sub">CV · Talent · Code · Profile</div>
      </div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  9. ACCOUNT + INTERVIEW MGMT  */}
    <div className="zrw-split">
      <div className="zrw-node" style={{minWidth: '130px'}}>
        <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
        <div className="zrw-node-label">Account<br />Management</div>
      </div>
      <div className="zrw-node" style={{minWidth: '130px'}}>
        <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div className="zrw-node-label">Interview<br />Management</div>
      </div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  10. RIGHT CANDIDATES HIRED  */}
    <div className="zrw-node hired">
      <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div className="zrw-node-label">Right<br />Candidates<br />Hired</div>
      <div className="zrw-node-sub">Onboarding Ready</div>
    </div>

    <div className="zrw-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

    {/*  11. BENCHMARKING + NEGOTIATION  */}
    <div className="zrw-split">
      <div className="zrw-node" style={{minWidth: '140px'}}>
        <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
        <div className="zrw-node-label">Candidate-Specific<br />Benchmarking</div>
      </div>
      <div className="zrw-node" style={{minWidth: '140px'}}>
        <div className="zrw-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div className="zrw-node-label">Negotiation<br />Experts</div>
      </div>
    </div>

  </div>{/*  end canvas  */}
</section>
    </div>
  );
};

export default ZepProPipeline;
