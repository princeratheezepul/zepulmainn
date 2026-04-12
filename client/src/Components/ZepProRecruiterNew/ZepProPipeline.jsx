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

        <div className="zrw-image-container reveal" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 20px',
          width: '100%',
          overflow: 'hidden'
        }}>
          <img
            src="/pro recruiter flow.png"
            alt="Zep Pro Recruiter Flow"
            style={{
              width: '95vw',
              maxWidth: '100vw',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>{/*  end canvas  */}
      </section>
    </div>
  );
};

export default ZepProPipeline;
