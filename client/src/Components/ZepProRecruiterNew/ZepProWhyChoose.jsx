import React, { useEffect } from 'react';

const ZepProWhyChoose = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepProWhyChoose-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepProWhyChoose-root" className="zep-pro-recruiter-page">
      <section className="zrw-why">
  <div className="zrw-why-header reveal">
    <h2 className="section-head">Why Businesses<br /><span className="blue">Choose Zepul?</span></h2>
    <p className="section-sub">From outdated limitations to AI-powered solutions — here's how Zepul solves every hiring challenge.</p>
  </div>

  <table className="zrw-compare reveal">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Traditional Recruitment</th>
        <th>Zepul AI Pipeline</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Multi-Channel Sourcing</td>
        <td><svg className="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Manual keyword searches & limited databases</td>
        <td><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> AI-powered discovery across job boards, databases & partners</td>
      </tr>
      <tr>
        <td>AI CV Matching</td>
        <td><svg className="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Subjective human screening, prone to bias and delays</td>
        <td><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Automated ranking with precision scoring</td>
      </tr>
      <tr>
        <td>Decision-Ready Data</td>
        <td><svg className="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Scattered notes and fragmented email chains</td>
        <td><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Comprehensive Report Cards (CV, Code & Interview ranks)</td>
      </tr>
      <tr>
        <td>Bias-Free Interviews</td>
        <td><svg className="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Unstructured, inconsistent, and scheduling nightmares</td>
        <td><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> 100% AI-driven structured interviews with clear summaries</td>
      </tr>
      <tr>
        <td>Dynamic Assessments</td>
        <td><svg className="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Generic tests or heavy reliance on hiring managers</td>
        <td><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Personalised coding & technical tests generated per role</td>
      </tr>
      <tr>
        <td>Offer Intelligence</td>
        <td><svg className="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Guesswork and opaque market rate matching</td>
        <td><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Detailed salary benchmarking & dedicated negotiation</td>
      </tr>
      <tr>
        <td>Scalable Network</td>
        <td><svg className="cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Bottlenecked by internal recruiter bandwidth</td>
        <td><svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Infinite scaling via AI + Global on-demand recruiter network</td>
      </tr>
    </tbody>
  </table>
</section>
    </div>
  );
};

export default ZepProWhyChoose;
