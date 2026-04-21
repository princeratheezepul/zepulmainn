import React, { useEffect } from 'react';

const ZepProPipeline = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepProPipeline-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepProPipeline-root" className="zep-pro-recruiter-page">
      <section className="zrw">
        <div className="zrw-header reveal" style={{ padding: '0 52px', marginBottom: '20px' }}>
          <h2 className="section-head" style={{ textAlign: 'left', width: '100%' }}>How <span className="blue">Zep Pro Recruiter</span> Works</h2>
          <div className="zrw-subtitle-row reveal" style={{
            fontFamily: "'Lora', serif",
            fontWeight: 400,
            fontSize: '32px',
            lineHeight: '100%',
            letterSpacing: '-1.25px',
            color: '#0C0E16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '14px',
            width: '100%',
            textAlign: 'center'
          }}>
            {/* <span style={{ color: '#024BFF', fontSize: '24px', fontWeight: 800 }}>&raquo;</span>
            <span>Global talent and recruiter network, without boundaries.</span>
            <span style={{ color: '#024BFF', fontSize: '24px', fontWeight: 800 }}>&raquo;</span> */}
          </div>
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
