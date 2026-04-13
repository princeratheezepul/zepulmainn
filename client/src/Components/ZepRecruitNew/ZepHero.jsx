import React, { useEffect } from 'react';

const ZepHero = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepHero-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  useEffect(() => { const io = new IntersectionObserver(entries => { entries.forEach(({ isIntersecting, target: el }) => { if (!isIntersecting) return; const end = +el.dataset.target, sfx = el.dataset.suffix; let s = null; const run = ts => { if (!s) s = ts; const p = Math.min((ts - s) / 1100, 1); el.textContent = Math.round((1 - (1 - p) ** 3) * end) + (sfx || ''); if (p < 1) requestAnimationFrame(run); }; requestAnimationFrame(run); io.unobserve(el); }); }, { threshold: .5 }); const rootNode = document.getElementById('ZepHero-root'); if (rootNode) rootNode.querySelectorAll('.counter').forEach(el => io.observe(el)); return () => io.disconnect(); }, []);
  return (
    <div id="ZepHero-root" className="zep-recruit-page">
      <section className="zr-hero">
        <div className="zr-hero-left">
          <h1 className="zr-headline">ZEP<br /><span className="blue">RECRUIT</span></h1>
          <p className="zr-tagline">Recruitment. Reengineered by AI.</p>
          <p className="zr-desc">Reimagining recruitment with AI — from success-based hiring to integrated RaaS, RPO, and retainer models. Partner with us on your hiring mandate and let our full-stack AI-powered TA platform, seamlessly combined with expert recruiters, deliver faster, smarter hiring.</p>
          <div className="zr-stats">
            <div className="zr-stat">
              <div className="zr-stat-n" style={{ display: 'flex', alignItems: 'center' }}><span className="counter" data-target="40" data-suffix="%">40%</span><svg width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '12px', verticalAlign: '-0.05em' }}><line x1="12" y1="21" x2="12" y2="3"></line><polyline points="5 10 12 3 19 10"></polyline></svg></div>
              <div className="zr-stat-l">Better Talent Match Accuracy</div>
            </div>
            <div className="zr-stat">
              <div className="zr-stat-n" style={{ display: 'flex', alignItems: 'center' }}><span className="counter" data-target="60" data-suffix="%">60%</span><svg width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '12px', verticalAlign: '-0.05em' }}><line x1="12" y1="21" x2="12" y2="3"></line><polyline points="5 10 12 3 19 10"></polyline></svg></div>
              <div className="zr-stat-l">Talent Reach</div>
            </div>
            <div className="zr-stat">
              <div className="zr-stat-n" style={{ display: 'flex', alignItems: 'center' }}><span className="counter" data-target="90" data-suffix="%">90%</span><svg width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '12px', verticalAlign: '-0.05em' }}><line x1="12" y1="21" x2="12" y2="3"></line><polyline points="5 10 12 3 19 10"></polyline></svg></div>
              <div className="zr-stat-l">Automated Screening &amp; Evaluation</div>
            </div>
            <div className="zr-stat">
              <div className="zr-stat-n" style={{ display: 'flex', alignItems: 'center' }}><span className="counter" data-target="45" data-suffix="%">45%</span><svg width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '12px', verticalAlign: '-0.05em' }}><line x1="12" y1="21" x2="12" y2="3"></line><polyline points="5 10 12 3 19 10"></polyline></svg></div>
              <div className="zr-stat-l">Overall Hiring Cost Reduction</div>
            </div>
          </div>
          <button className="zr-cta">
            Book a Demo
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M7 2l5 5-5 5" /></svg>
          </button>
        </div>

        {/*  Hero right: orbit illustration  */}
        <div className="zr-hero-right">
          <div className="zr-orbit">
            <div className="zr-orbit-ring zr-orbit-ring-outer"></div>
            <div className="zr-orbit-ring zr-orbit-ring-mid"></div>
            <div className="zr-orbit-ring zr-orbit-ring-inner"></div>
            <div className="zr-dot zr-dot-a"></div>
            <div className="zr-dot zr-dot-b"></div>
            <div className="zr-dot zr-dot-c"></div>

            {/*  Centre orb: star/hire icon  */}
            <div className="zr-orb">
              <svg viewBox="0 0 44 44" fill="none">
                <path d="M22 6 l4 9 9.5 1.4-6.9 6.7 1.6 9.4L22 28l-8.2 4.5 1.6-9.4-6.9-6.7 9.5-1.4z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(255,255,255,.15)" />
                <path d="M22 17l1.8 4h4.2l-3.4 2.5 1.3 4L22 25l-3.9 2.5 1.3-4L16 21h4.2z" fill="white" opacity=".9" />
              </svg>
            </div>

            {/*  Float TL: Active Talent Pool  */}
            <div className="zr-float zr-float-tl">
              <div className="zr-float-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
              </div>
              <div className="zr-float-label">Active Talent Pool</div>
              <div className="zr-float-value">400K+</div>
              <div className="zr-float-sub">Verified global candidates</div>
            </div>

            {/*  Float TR: Expert Recruiters  */}
            <div className="zr-float zr-float-tr">
              <div className="zr-float-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              </div>
              <div className="zr-float-label">Expert Recruiters</div>
              <div className="zr-float-value">150+</div>
              <div className="zr-float-sub">On-demand global network</div>
            </div>

            {/*  Float BL: Placements Delivered  */}
            <div className="zr-float zr-float-bl">
              <div className="zr-float-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <div className="zr-float-label">Placements Delivered</div>
              <div className="zr-float-value">5000+</div>
              <div className="zr-float-sub">Successful hires globally</div>
            </div>

            {/*  Float BR: Cost Reduction  */}
            <div className="zr-float zr-float-br">
              <div className="zr-float-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              </div>
              <div className="zr-float-label">Hiring Cost Reduction</div>
              <div className="zr-float-value">45%</div>
              <div className="zr-float-sub">Average across clients</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ZepHero;
