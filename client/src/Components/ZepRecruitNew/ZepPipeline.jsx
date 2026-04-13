import React, { useEffect } from 'react';

const ZepPipeline = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepPipeline-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepPipeline-root" className="zep-recruit-page">
      <section className="zrw" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="zrw-header reveal">
          <h2 className="section-head">How <span className="blue">Zep Recruit</span> Works</h2>
          <p className="section-sub">An end-to-end, AI-powered recruitment pipeline — from talent sourcing to right candidate hired.</p>
        </div>

        {/*  Agile & Lean bar  */}
        <div className="zrw-agile-bar reveal">
          <span className="zrw-agile-arrows">&raquo;</span>
          <span className="zrw-agile-text">Agile &amp; Lean Methodologies</span>
          <span className="zrw-agile-arrows">&raquo;</span>
        </div>

        <div className="zrw-canvas-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0', flexGrow: 1 }}>
          <img src="/zeprecruitFlow.png" alt="ZepRecruit Flow" style={{ width: '90vw', maxWidth: '100vw', height: 'auto', objectFit: 'contain' }} className="reveal" />
        </div>
      </section>
    </div>
  );
};

export default ZepPipeline;
