import React, { useEffect } from 'react';

const ZepProHero = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepProHero-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  useEffect(() => { const io = new IntersectionObserver(entries => { entries.forEach(({ isIntersecting, target: el }) => { if (!isIntersecting) return; const end = +el.dataset.target, sfx = el.dataset.suffix; let s = null; const run = ts => { if (!s) s = ts; const p = Math.min((ts - s) / 1100, 1); el.textContent = Math.round((1 - (1 - p) ** 3) * end) + (sfx || ''); if (p < 1) requestAnimationFrame(run); }; requestAnimationFrame(run); io.unobserve(el); }); }, { threshold: .5 }); const rootNode = document.getElementById('ZepProHero-root'); if (rootNode) rootNode.querySelectorAll('.counter').forEach(el => io.observe(el)); return () => io.disconnect(); }, []);
  return (
    <div id="ZepProHero-root" className="zep-pro-recruiter-page">
      <section className="zr-hero">
        <div className="zr-hero-left">
          <h1 className="zr-headline">ZEP PRO<br /><span className="blue">RECRUITER</span></h1>
          <p className="zr-tagline">Turning Recruiters into Pro Recruiters.</p>
          <p className="zr-desc">Empower your recruiters with a unified, AI-driven
            platform to source talent, assess CV strength, run
            dynamic coding assessments, and conduct fully
            automated interviews—generating comprehensive,
            decision-ready report cards in one place. Real-time
            dashboards provide complete visibility into recruiter
            and business performance. The result: more
            productive recruiters, higher-quality hires, and
            significantly reduced time and cost to hire.</p>
          <div className="zr-stats">
            <div className="zr-stat">
              <div className="zr-stat-n">
                <span className="counter" data-target="40" data-suffix="%">40%</span>
                <span className="zr-stat-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </span>
              </div>
              <div className="zr-stat-l">Better Talent Match Accuracy</div>
            </div>
            <div className="zr-stat">
              <div className="zr-stat-n">
                <span className="counter" data-target="100" data-suffix="%">100%</span>
                <span className="zr-stat-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </span>
              </div>
              <div className="zr-stat-l">AI DIY Ready</div>
            </div>
            <div className="zr-stat">
              <div className="zr-stat-n">
                <span className="counter" data-target="90" data-suffix="%">90%</span>
                <span className="zr-stat-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </span>
              </div>
              <div className="zr-stat-l">Automated Screening &amp; Evaluation</div>
            </div>
            <div className="zr-stat">
              <div className="zr-stat-n">
                <span className="counter" data-target="45" data-suffix="%">45%</span>
                <span className="zr-stat-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </span>
              </div>
              <div className="zr-stat-l">Overall Hiring Cost Reduction</div>
            </div>
          </div>
          <button className="zr-cta">
            Book a Demo
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M7 2l5 5-5 5" /></svg>
          </button>
        </div>

        {/*  Hero right: V4 Flowing Paths  */}
        <div className="zr-hero-right">
          <div className="v4-scene">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 480" width="520" height="480" style={{ overflow: 'visible' }}>
              <defs>
                {/*  Motion paths (hidden, used by animateMotion)  */}
                <path id="mp1" d="M230,238 C275,185 385,118 468,88" />
                <path id="mp2" d="M230,240 C318,238 420,236 494,234" />
                <path id="mp3" d="M230,242 C272,302 382,358 462,386" />

                {/*  Orb gradient  */}
                <radialGradient id="v4-orb" cx="35%" cy="32%" r="65%">
                  <stop offset="0%" stop-color="#6fa0ff" />
                  <stop offset="55%" stop-color="#024BFF" />
                  <stop offset="100%" stop-color="#0028bb" />
                </radialGradient>

                {/*  Glow gradient  */}
                <radialGradient id="v4-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#024BFF" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#024BFF" stop-opacity="0" />
                </radialGradient>

                {/*  Card drop shadow  */}
                <filter id="v4-shadow" x="-25%" y="-40%" width="150%" height="180%">
                  <feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#000" flood-opacity="0.10" />
                </filter>

                {/*  Agent glow filter  */}
                <filter id="v4-agent-glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/*  Connecting path between endpoints (SOURCED → MATCHED → HIRED)  */}
                <path id="mp-connect" d="M468,88 Q505,160 494,234 Q483,310 462,386" />
              </defs>

              {/*  Background wave 1  */}
              <path d="M0,245 Q120,168 240,245 T480,245" stroke="#E8EAF2" strokeWidth="1.5" fill="none">
                <animate attributeName="d" values="M0,245 Q120,168 240,245 T480,245;M0,245 Q120,322 240,245 T480,245;M0,245 Q120,168 240,245 T480,245" dur="9s" repeatCount="indefinite" />
              </path>
              {/*  Background wave 2  */}
              <path d="M0,192 Q120,128 240,192 T480,192" stroke="#E8EAF2" strokeWidth="1" fill="none" opacity="0.5">
                <animate attributeName="d" values="M0,192 Q120,128 240,192 T480,192;M0,192 Q120,258 240,192 T480,192;M0,192 Q120,128 240,192 T480,192" dur="12s" repeatCount="indefinite" />
              </path>

              {/*  Dashed path lines (visible guides)  */}
              <path d="M230,238 C275,185 385,118 468,88" stroke="#D5DAEE" strokeWidth="1.5" fill="none" strokeDasharray="5 5" />
              <path d="M230,240 C318,238 420,236 494,234" stroke="#D5DAEE" strokeWidth="1.5" fill="none" strokeDasharray="5 5" />
              <path d="M230,242 C272,302 382,358 462,386" stroke="#D5DAEE" strokeWidth="1.5" fill="none" strokeDasharray="5 5" />

              {/*  Connecting arc between endpoints: SOURCED → MATCHED → HIRED  */}
              <path d="M468,88 Q505,160 494,234 Q483,310 462,386" stroke="#024BFF" strokeWidth="1.5" fill="none" opacity="0.18" strokeDasharray="4 4" />

              {/*  Agent traveling the connecting arc  */}
              <g filter="url(#v4-agent-glow)">
                <circle r="5" fill="#024BFF" opacity="0.9">
                  <animateMotion dur="5s" repeatCount="indefinite" rotate="none">
                    <mpath href="#mp-connect" />
                  </animateMotion>
                </circle>
              </g>

              {/*  Endpoint nodes (bigger with pulsing outer ring)  */}
              {/*  SOURCED node  */}
              <circle cx="468" cy="88" r="16" fill="none" stroke="#024BFF" strokeWidth="1" opacity="0.12">
                <animate attributeName="r" values="14;20;14" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="468" cy="88" r="10" fill="#024BFF" opacity="0.08" />
              <circle cx="468" cy="88" r="5.5" fill="#024BFF" opacity="0.5" />

              {/*  MATCHED node  */}
              <circle cx="494" cy="234" r="16" fill="none" stroke="#024BFF" strokeWidth="1" opacity="0.12">
                <animate attributeName="r" values="14;20;14" dur="3.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="494" cy="234" r="10" fill="#024BFF" opacity="0.08" />
              <circle cx="494" cy="234" r="5.5" fill="#024BFF" opacity="0.5" />

              {/*  HIRED node  */}
              <circle cx="462" cy="386" r="16" fill="none" stroke="#024BFF" strokeWidth="1" opacity="0.12">
                <animate attributeName="r" values="14;20;14" dur="3.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="462" cy="386" r="10" fill="#024BFF" opacity="0.08" />
              <circle cx="462" cy="386" r="5.5" fill="#024BFF" opacity="0.5" />

              {/*  Endpoint labels  */}
              <text x="468" y="66" text-anchor="middle" fill="#7A7E92" font-family="DM Sans, sans-serif" font-size="9.5" font-weight="600" letter-spacing="0.06em">SOURCED</text>
              <text x="516" y="229" text-anchor="start" fill="#7A7E92" font-family="DM Sans, sans-serif" font-size="9.5" font-weight="600" letter-spacing="0.06em">MATCHED</text>
              <text x="462" y="412" text-anchor="middle" fill="#7A7E92" font-family="DM Sans, sans-serif" font-size="9.5" font-weight="600" letter-spacing="0.06em">HIRED</text>

              {/*  Agent particles traveling along each main path (glowing dots)  */}
              {/*  Agent 1: path 1 (upper)  */}
              <g filter="url(#v4-agent-glow)">
                <circle r="4" fill="#024BFF" opacity="0.85">
                  <animateMotion dur="3s" repeatCount="indefinite" rotate="none">
                    <mpath href="#mp1" />
                  </animateMotion>
                </circle>
              </g>
              {/*  Agent 2: path 2 (middle)  */}
              <g filter="url(#v4-agent-glow)">
                <circle r="4" fill="#024BFF" opacity="0.85">
                  <animateMotion dur="4s" repeatCount="indefinite" rotate="none" begin="1s">
                    <mpath href="#mp2" />
                  </animateMotion>
                </circle>
              </g>
              {/*  Agent 3: path 3 (lower)  */}
              <g filter="url(#v4-agent-glow)">
                <circle r="4" fill="#024BFF" opacity="0.85">
                  <animateMotion dur="3.5s" repeatCount="indefinite" rotate="none" begin="2s">
                    <mpath href="#mp3" />
                  </animateMotion>
                </circle>
              </g>

              {/*  Pulsing glow around orb  */}
              <circle cx="230" cy="240" r="80" fill="url(#v4-glow)">
                <animate attributeName="r" values="75;108;75" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.6;1" dur="4s" repeatCount="indefinite" />
              </circle>

              {/*  Orb outer ring  */}
              <circle cx="230" cy="240" r="38" fill="none" stroke="rgba(2,75,255,0.10)" strokeWidth="10" />

              {/*  Central orb  */}
              <circle cx="230" cy="240" r="28" fill="url(#v4-orb)" />

              {/*  AI label  */}
              <text x="230" y="241" text-anchor="middle" dominantBaseline="middle" fill="white" font-family="DM Sans, sans-serif" font-size="11" font-weight="700" letter-spacing="0.06em">AI</text>

              {/*  CARD 1: "Candidate Match" — blue pill, path 1 (upper)  */}
              <g filter="url(#v4-shadow)">
                <rect x="-58" y="-18" width="116" height="36" rx="9" fill="#024BFF" />
                <text x="0" y="1" text-anchor="middle" dominantBaseline="middle" fill="white" font-family="DM Sans, sans-serif" font-size="11" font-weight="600" letter-spacing="0.01em">Candidate Match</text>
                <animateMotion dur="6s" repeatCount="indefinite" rotate="none">
                  <mpath href="#mp1" />
                </animateMotion>
              </g>

              {/*  CARD 2: "Interview Ready" — white/blue border, path 2 (middle)  */}
              <g filter="url(#v4-shadow)">
                <rect x="-58" y="-18" width="116" height="36" rx="9" fill="white" stroke="#024BFF" strokeWidth="1.5" />
                <text x="0" y="1" text-anchor="middle" dominantBaseline="middle" fill="#024BFF" font-family="DM Sans, sans-serif" font-size="11" font-weight="600" letter-spacing="0.01em">Interview Ready</text>
                <animateMotion dur="8s" repeatCount="indefinite" rotate="none" begin="1.2s">
                  <mpath href="#mp2" />
                </animateMotion>
              </g>

              {/*  CARD 3: "Job Fit: 94%" — white/rule border, path 3 (lower)  */}
              <g filter="url(#v4-shadow)">
                <rect x="-52" y="-18" width="104" height="36" rx="9" fill="white" stroke="#E3E5EE" strokeWidth="1.5" />
                <text x="0" y="1" text-anchor="middle" dominantBaseline="middle" fill="#0C0E16" font-family="DM Sans, sans-serif" font-size="11" font-weight="500" letter-spacing="0.01em">Job Fit: 94%</text>
                <animateMotion dur="7s" repeatCount="indefinite" rotate="none" begin="2.4s">
                  <mpath href="#mp3" />
                </animateMotion>
              </g>
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ZepProHero;
