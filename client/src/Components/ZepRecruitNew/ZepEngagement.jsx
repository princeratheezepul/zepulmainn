import React, { useEffect } from 'react';

const ZepEngagement = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepEngagement-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  return (
    <div id="ZepEngagement-root" className="zep-recruit-page">
      <section className="zr-engage">
  <div className="zr-engage-header reveal">
    <h2 className="section-head">Choose Your <span className="blue">Engagement Model</span></h2>
    <p className="section-sub">Flexible engagement options designed for every stage of your hiring journey.</p>
  </div>
  <div className="zr-engage-grid">
    {/*  Card 1: Direct Hiring  */}
    <div className="zr-engage-card reveal">
      <div className="zr-engage-num">01</div>
      <div className="zr-engage-illus">
        <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="dhG" x1="0" x2="1"><stop offset="0%" stop-color="#024BFF"/><stop offset="100%" stop-color="#4d83ff"/></linearGradient></defs>
          <rect width="280" height="120" fill="rgba(2,75,255,.02)"/>
          {/*  Candidate cards rising  */}
          <g transform="translate(20, 30)">
            <rect width="60" height="60" rx="6" fill="#fff" stroke="rgba(2,75,255,.18)" strokeWidth="1"/>
            <circle cx="30" cy="22" r="9" fill="rgba(2,75,255,.12)"/>
            <circle cx="30" cy="19" r="4" fill="#024BFF" opacity=".5"/>
            <path d="M22 30 q8 -6 16 0" stroke="#024BFF" strokeWidth="1.2" fill="none" opacity=".5"/>
            <rect x="14" y="42" width="32" height="3" rx="1.5" fill="rgba(2,75,255,.15)"/>
            <rect x="18" y="49" width="24" height="3" rx="1.5" fill="rgba(2,75,255,.1)"/>
          </g>
          <g transform="translate(110, 30)">
            <rect width="60" height="60" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1.4"/>
            <circle cx="30" cy="22" r="9" fill="rgba(2,75,255,.18)"/>
            <circle cx="30" cy="19" r="4" fill="#024BFF" opacity=".7"/>
            <path d="M22 30 q8 -6 16 0" stroke="#024BFF" strokeWidth="1.2" fill="none" opacity=".7"/>
            <rect x="14" y="42" width="32" height="3" rx="1.5" fill="rgba(2,75,255,.2)"/>
            <rect x="18" y="49" width="24" height="3" rx="1.5" fill="rgba(2,75,255,.15)"/>
            {/*  Selected check  */}
            <circle cx="50" cy="12" r="8" fill="#024BFF"><animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/></circle>
            <polyline points="46,12 49,15 54,9" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <g transform="translate(200, 30)">
            <rect width="60" height="60" rx="6" fill="#fff" stroke="rgba(2,75,255,.18)" strokeWidth="1"/>
            <circle cx="30" cy="22" r="9" fill="rgba(2,75,255,.12)"/>
            <circle cx="30" cy="19" r="4" fill="#024BFF" opacity=".5"/>
            <path d="M22 30 q8 -6 16 0" stroke="#024BFF" strokeWidth="1.2" fill="none" opacity=".5"/>
            <rect x="14" y="42" width="32" height="3" rx="1.5" fill="rgba(2,75,255,.15)"/>
            <rect x="18" y="49" width="24" height="3" rx="1.5" fill="rgba(2,75,255,.1)"/>
          </g>
          <text x="140" y="110" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" font-weight="700" fill="#024BFF">PAY ON SUCCESSFUL HIRE</text>
        </svg>
      </div>
      <div className="zr-engage-title">Direct Hiring</div>
      <div className="zr-engage-desc">Hire full-time talent with a success-based model.</div>
      <ul className="zr-engage-features">
        <li>100% AI perspective and final human validation</li>
        <li>Pay only on successful closure</li>
        <li>One-time placement fee</li>
        <li>Replacement support included</li>
      </ul>
    </div>
    {/*  Card 2: Contracting  */}
    <div className="zr-engage-card reveal">
      <div className="zr-engage-num">02</div>
      <div className="zr-engage-illus">
        <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="120" fill="rgba(2,75,255,.02)"/>
          {/*  Calendar frame  */}
          <rect x="80" y="22" width="120" height="80" rx="6" fill="#fff" stroke="rgba(2,75,255,.2)" strokeWidth="1.2"/>
          <rect x="80" y="22" width="120" height="18" rx="6" fill="#024BFF"/>
          <text x="140" y="35" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" font-weight="700" fill="#fff">FLEXIBLE TERMS</text>
          {/*  Calendar grid  */}
          <g font-family="DM Sans,sans-serif" font-size="6.5" fill="rgba(12,14,22,.5)">
            <text x="92" y="52">M</text><text x="108" y="52">T</text><text x="124" y="52">W</text><text x="140" y="52">T</text><text x="156" y="52">F</text><text x="172" y="52">S</text><text x="188" y="52">S</text>
          </g>
          <g>
            <rect x="88" y="58" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"><animate attributeName="fill" values="rgba(2,75,255,.08);rgba(2,75,255,.4);rgba(2,75,255,.08)" dur="3s" repeatCount="indefinite"/></rect>
            <rect x="104" y="58" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"><animate attributeName="fill" values="rgba(2,75,255,.08);rgba(2,75,255,.4);rgba(2,75,255,.08)" dur="3s" begin=".2s" repeatCount="indefinite"/></rect>
            <rect x="120" y="58" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"><animate attributeName="fill" values="rgba(2,75,255,.08);rgba(2,75,255,.4);rgba(2,75,255,.08)" dur="3s" begin=".4s" repeatCount="indefinite"/></rect>
            <rect x="136" y="58" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"><animate attributeName="fill" values="rgba(2,75,255,.08);rgba(2,75,255,.4);rgba(2,75,255,.08)" dur="3s" begin=".6s" repeatCount="indefinite"/></rect>
            <rect x="152" y="58" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"><animate attributeName="fill" values="rgba(2,75,255,.08);rgba(2,75,255,.4);rgba(2,75,255,.08)" dur="3s" begin=".8s" repeatCount="indefinite"/></rect>
            <rect x="168" y="58" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
            <rect x="184" y="58" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
            <rect x="88" y="72" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
            <rect x="104" y="72" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
            <rect x="120" y="72" width="12" height="10" rx="1.5" fill="#024BFF"><animate attributeName="opacity" values=".6;1;.6" dur="2s" repeatCount="indefinite"/></rect>
            <rect x="136" y="72" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
            <rect x="152" y="72" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
            <rect x="168" y="72" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
            <rect x="184" y="72" width="12" height="10" rx="1.5" fill="rgba(2,75,255,.08)"/>
          </g>
          <text x="140" y="98" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="6.5" fill="rgba(12,14,22,.45)">Scale up · Scale down · Pay monthly</text>
        </svg>
      </div>
      <div className="zr-engage-title">Contracting</div>
      <div className="zr-engage-desc">Flexible workforce for short- or long-term needs.</div>
      <ul className="zr-engage-features">
        <li>100% AI perspective and final human validation</li>
        <li>Monthly billing model</li>
        <li>Quick scale up or down</li>
        <li>Compliance and payroll managed</li>
      </ul>
    </div>
    {/*  Card 3: RaaS & On-Demand  */}
    <div className="zr-engage-card reveal">
      <div className="zr-engage-num">03</div>
      <div className="zr-engage-illus">
        <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="280" height="120" fill="rgba(2,75,255,.02)"/>
          {/*  Central hub  */}
          <circle cx="140" cy="60" r="38" fill="none" stroke="rgba(2,75,255,.12)" strokeWidth="1" strokeDasharray="3 3"><animateTransform attributeName="transform" type="rotate" from="0 140 60" to="360 140 60" dur="20s" repeatCount="indefinite"/></circle>
          <circle cx="140" cy="60" r="22" fill="#024BFF"/>
          <text x="140" y="58" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="7" font-weight="700" fill="#fff">RAAS</text>
          <text x="140" y="68" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="5.5" fill="rgba(255,255,255,.75)">HUB</text>
          {/*  Orbiting recruiter chips  */}
          <g>
            <g><circle cx="140" cy="22" r="9" fill="#fff" stroke="rgba(2,75,255,.3)" strokeWidth="1"/><circle cx="140" cy="20" r="3" fill="#024BFF"/><path d="M134 28 q6 -4 12 0" stroke="#024BFF" strokeWidth="1" fill="none"/><animateTransform attributeName="transform" type="rotate" from="0 140 60" to="360 140 60" dur="14s" repeatCount="indefinite"/></g>
          </g>
          <g>
            <g><circle cx="140" cy="22" r="9" fill="#fff" stroke="rgba(2,75,255,.3)" strokeWidth="1"/><circle cx="140" cy="20" r="3" fill="#024BFF"/><path d="M134 28 q6 -4 12 0" stroke="#024BFF" strokeWidth="1" fill="none"/><animateTransform attributeName="transform" type="rotate" from="120 140 60" to="480 140 60" dur="14s" repeatCount="indefinite"/></g>
          </g>
          <g>
            <g><circle cx="140" cy="22" r="9" fill="#fff" stroke="rgba(2,75,255,.3)" strokeWidth="1"/><circle cx="140" cy="20" r="3" fill="#024BFF"/><path d="M134 28 q6 -4 12 0" stroke="#024BFF" strokeWidth="1" fill="none"/><animateTransform attributeName="transform" type="rotate" from="240 140 60" to="600 140 60" dur="14s" repeatCount="indefinite"/></g>
          </g>
          <text x="140" y="115" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="7" font-weight="700" fill="#024BFF">ON-DEMAND RECRUITER NETWORK</text>
        </svg>
      </div>
      <div className="zr-engage-title">RaaS &amp; On-Demand</div>
      <div className="zr-engage-desc">Subscription-based recruiting support as needed.</div>
      <ul className="zr-engage-features">
        <li>100% AI perspective and final human validation</li>
        <li>Flexible &amp; balanced payment models</li>
        <li>Dedicated recruiter access</li>
        <li>Scalable hiring support on demand</li>
      </ul>
    </div>
  </div>
</section>
    </div>
  );
};

export default ZepEngagement;
