import React from 'react';

const LandingEngagement = () => {
  return (
    <section className="lp-engage lp-section-pad">
      <h2 className="lp-section-head lp-reveal">Choose Your <span className="lp-blue">Engagement Model</span></h2>
      <p className="lp-section-sub lp-reveal">Flexible, tiered engagement options built for every stage of your hiring journey.</p>

      <div className="lp-engage-grid lp-reveal">

        {/* Card 1: Zep Pro Recruiter */}
        <div className="lp-engage-card">
          <div className="lp-engage-card-img">
            <svg className="lp-engage-anim" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lpPhGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#024BFF" />
                  <stop offset="100%" stopColor="#4d83ff" />
                </linearGradient>
                <pattern id="lpPhGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                </pattern>
              </defs>
              <rect width="320" height="200" fill="url(#lpPhGrid)" />

              {/* Pro Recruiter Console */}
              <rect x="20" y="18" width="280" height="164" rx="8" fill="#fff" stroke="rgba(2,75,255,.14)" strokeWidth="1" />
              <rect x="20" y="18" width="280" height="22" rx="8" fill="rgba(2,75,255,.05)" />
              <circle cx="32" cy="29" r="2.2" fill="rgba(2,75,255,.2)" />
              <circle cx="40" cy="29" r="2.2" fill="rgba(2,75,255,.13)" />
              <circle cx="48" cy="29" r="2.2" fill="rgba(2,75,255,.08)" />
              <text x="160" y="32" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="7" fontWeight="700" fill="#024BFF">Pro Recruiter Console — All in One Place</text>

              {/* SOURCE */}
              <g transform="translate(28, 50)">
                <rect width="52" height="44" rx="5" fill="rgba(2,75,255,.04)" stroke="rgba(2,75,255,.14)" strokeWidth=".8" />
                <circle cx="26" cy="16" r="6" fill="none" stroke="#024BFF" strokeWidth="1.2" />
                <line x1="30" y1="20" x2="34" y2="24" stroke="#024BFF" strokeWidth="1.2" />
                <text x="26" y="35" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700" fill="#024BFF">SOURCE</text>
              </g>
              {/* AI SCREEN */}
              <g transform="translate(84, 50)">
                <rect width="52" height="44" rx="5" fill="rgba(2,75,255,.04)" stroke="rgba(2,75,255,.14)" strokeWidth=".8" />
                <rect x="18" y="9" width="16" height="14" rx="1.5" fill="none" stroke="#024BFF" strokeWidth="1" />
                <line x1="20" y1="13" x2="32" y2="13" stroke="#024BFF" strokeWidth=".8" />
                <line x1="20" y1="16" x2="32" y2="16" stroke="#024BFF" strokeWidth=".8" />
                <line x1="20" y1="19" x2="28" y2="19" stroke="#024BFF" strokeWidth=".8" />
                <text x="26" y="35" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700" fill="#024BFF">AI SCREEN</text>
              </g>
              {/* AI ASSESS */}
              <g transform="translate(140, 50)">
                <rect width="52" height="44" rx="5" fill="rgba(2,75,255,.04)" stroke="rgba(2,75,255,.14)" strokeWidth=".8" />
                <circle cx="26" cy="16" r="7" fill="none" stroke="#024BFF" strokeWidth="1.2" />
                <polyline points="22,16 25,19 30,13" stroke="#024BFF" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <text x="26" y="35" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700" fill="#024BFF">AI ASSESS</text>
              </g>
              {/* AI INTERVIEW */}
              <g transform="translate(196, 50)">
                <rect width="52" height="44" rx="5" fill="rgba(2,75,255,.04)" stroke="rgba(2,75,255,.14)" strokeWidth=".8" />
                <rect x="18" y="9" width="14" height="10" rx="1.5" fill="none" stroke="#024BFF" strokeWidth="1" />
                <polygon points="32,12 36,10 36,18 32,16" fill="#024BFF" opacity=".7" />
                <circle cx="22" cy="13" r="1.2" fill="#024BFF" />
                <text x="26" y="35" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700" fill="#024BFF">AI INTERVIEW</text>
              </g>
              {/* MANAGE */}
              <g transform="translate(252, 50)">
                <rect width="40" height="44" rx="5" fill="#024BFF" stroke="#024BFF" />
                <circle cx="20" cy="14" r="3" fill="#fff" />
                <circle cx="13" cy="18" r="2.2" fill="#fff" opacity=".7" />
                <circle cx="27" cy="18" r="2.2" fill="#fff" opacity=".7" />
                <path d="M7 26 q6 -5 13 -5 t13 5" stroke="#fff" strokeWidth="1" fill="none" opacity=".7" />
                <text x="20" y="38" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700" fill="#fff">MANAGE</text>
              </g>

              {/* PERFORMANCE DASHBOARDS */}
              <text x="30" y="112" fontFamily="DM Sans,sans-serif" fontSize="6" fontWeight="700" fill="rgba(12,14,22,.4)">PERFORMANCE DASHBOARDS</text>

              {/* Business perf bar chart */}
              <g transform="translate(30, 118)">
                <rect width="126" height="54" rx="4" fill="rgba(2,75,255,.02)" stroke="rgba(2,75,255,.09)" strokeWidth=".6" />
                <text x="6" y="10" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="600" fill="rgba(12,14,22,.45)">BUSINESS</text>
                <text x="6" y="22" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#024BFF">94%</text>
                <g transform="translate(58, 14)">
                  <rect x="0" y="20" width="6" height="14" rx="1" fill="rgba(2,75,255,.3)"><animate attributeName="height" values="6;14;6" dur="2.6s" repeatCount="indefinite" /><animate attributeName="y" values="28;20;28" dur="2.6s" repeatCount="indefinite" /></rect>
                  <rect x="10" y="14" width="6" height="20" rx="1" fill="rgba(2,75,255,.45)"><animate attributeName="height" values="10;20;10" dur="2.6s" begin=".2s" repeatCount="indefinite" /><animate attributeName="y" values="24;14;24" dur="2.6s" begin=".2s" repeatCount="indefinite" /></rect>
                  <rect x="20" y="10" width="6" height="24" rx="1" fill="rgba(2,75,255,.6)"><animate attributeName="height" values="14;24;14" dur="2.6s" begin=".4s" repeatCount="indefinite" /><animate attributeName="y" values="20;10;20" dur="2.6s" begin=".4s" repeatCount="indefinite" /></rect>
                  <rect x="30" y="6" width="6" height="28" rx="1" fill="#024BFF"><animate attributeName="height" values="18;28;18" dur="2.6s" begin=".6s" repeatCount="indefinite" /><animate attributeName="y" values="16;6;16" dur="2.6s" begin=".6s" repeatCount="indefinite" /></rect>
                  <rect x="40" y="4" width="6" height="30" rx="1" fill="#024BFF"><animate attributeName="height" values="20;30;20" dur="2.6s" begin=".8s" repeatCount="indefinite" /><animate attributeName="y" values="14;4;14" dur="2.6s" begin=".8s" repeatCount="indefinite" /></rect>
                  <rect x="50" y="8" width="6" height="26" rx="1" fill="rgba(2,75,255,.7)"><animate attributeName="height" values="16;26;16" dur="2.6s" begin="1s" repeatCount="indefinite" /><animate attributeName="y" values="18;8;18" dur="2.6s" begin="1s" repeatCount="indefinite" /></rect>
                </g>
                <text x="6" y="48" fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.35)">Hire velocity</text>
              </g>

              {/* Recruiter perf list */}
              <g transform="translate(164, 118)">
                <rect width="126" height="54" rx="4" fill="rgba(2,75,255,.02)" stroke="rgba(2,75,255,.09)" strokeWidth=".6" />
                <text x="6" y="10" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="600" fill="rgba(12,14,22,.45)">RECRUITERS</text>
                <g transform="translate(6, 16)">
                  <circle cx="4" cy="4" r="3" fill="rgba(2,75,255,.15)" />
                  <rect x="10" y="2" width="60" height="4" rx="2" fill="rgba(2,75,255,.08)" />
                  <rect x="10" y="2" width="52" height="4" rx="2" fill="url(#lpPhGrad)"><animate attributeName="width" from="0" to="52" dur="1.4s" fill="freeze" /></rect>
                  <text x="92" y="6" fontFamily="DM Sans,sans-serif" fontSize="5" fontWeight="700" fill="#024BFF">92%</text>
                </g>
                <g transform="translate(6, 26)">
                  <circle cx="4" cy="4" r="3" fill="rgba(2,75,255,.15)" />
                  <rect x="10" y="2" width="60" height="4" rx="2" fill="rgba(2,75,255,.08)" />
                  <rect x="10" y="2" width="44" height="4" rx="2" fill="url(#lpPhGrad)"><animate attributeName="width" from="0" to="44" dur="1.6s" fill="freeze" /></rect>
                  <text x="92" y="6" fontFamily="DM Sans,sans-serif" fontSize="5" fontWeight="700" fill="#024BFF">78%</text>
                </g>
                <g transform="translate(6, 36)">
                  <circle cx="4" cy="4" r="3" fill="rgba(2,75,255,.15)" />
                  <rect x="10" y="2" width="60" height="4" rx="2" fill="rgba(2,75,255,.08)" />
                  <rect x="10" y="2" width="56" height="4" rx="2" fill="url(#lpPhGrad)"><animate attributeName="width" from="0" to="56" dur="1.8s" fill="freeze" /></rect>
                  <text x="92" y="6" fontFamily="DM Sans,sans-serif" fontSize="5" fontWeight="700" fill="#024BFF">96%</text>
                </g>
                <text x="6" y="50" fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.35)">You stay in control</text>
              </g>
            </svg>
          </div>
          <span className="lp-engage-badge lp-engage-badge-blue">AI RECRUITMENT PRODUCT</span>
          <div className="lp-engage-card-title">Zep Pro Recruiter</div>
          <div className="lp-engage-card-desc">Equip your team with our platform to source, AI screen, AI assess, AI interview, and manage in one place—while dashboards provide business and recruiter performance insights, so recruiters move faster and deliver high-quality talent data, while you stay in control.</div>
          <ul className="lp-engage-card-features">
            <li>All hiring steps in one place</li>
            <li>AI speeds up screening, assessment, and interviews</li>
            <li>Dashboards show recruiter and business performance</li>
            <li>Better quality talent data</li>
            <li>You stay in full control</li>
          </ul>
        </div>

        {/* Card 2: Zep Recruit */}
        <div className="lp-engage-card">
          <div className="lp-engage-card-img">
            <svg className="lp-engage-anim" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lpRrGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#024BFF" />
                  <stop offset="100%" stopColor="#4d83ff" />
                </linearGradient>
                <pattern id="lpRrGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                </pattern>
              </defs>
              <rect width="320" height="200" fill="url(#lpRrGrid)" />

              {/* Managed service banner */}
              <g transform="translate(16, 22)">
                <rect width="288" height="24" rx="12" fill="rgba(2,75,255,.05)" stroke="rgba(2,75,255,.2)" strokeWidth=".8" />
                <circle cx="18" cy="12" r="4" fill="#024BFF" />
                <path d="M15 12 l2 2 l4 -4" stroke="#fff" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <text x="144" y="16" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="8" fontWeight="700" fill="#024BFF">FULLY MANAGED BY ZEPUL — END-TO-END HIRING</text>
              </g>

              {/* 5-stage pipeline */}
              <g fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700">
                {/* SOURCE */}
                <g transform="translate(16, 58)">
                  <rect width="50" height="46" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1" />
                  <circle cx="25" cy="16" r="7" fill="none" stroke="#024BFF" strokeWidth="1.2" />
                  <line x1="30" y1="21" x2="34" y2="25" stroke="#024BFF" strokeWidth="1.2" strokeLinecap="round" />
                  <text x="25" y="37" textAnchor="middle" fill="#024BFF">SOURCE</text>
                </g>
                {/* SCREEN */}
                <g transform="translate(72, 58)">
                  <rect width="50" height="46" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1" />
                  <rect x="17" y="9" width="16" height="14" rx="1.5" fill="none" stroke="#024BFF" strokeWidth="1" />
                  <line x1="19" y1="13" x2="31" y2="13" stroke="#024BFF" strokeWidth=".8" />
                  <line x1="19" y1="16" x2="31" y2="16" stroke="#024BFF" strokeWidth=".8" />
                  <line x1="19" y1="19" x2="27" y2="19" stroke="#024BFF" strokeWidth=".8" />
                  <text x="25" y="37" textAnchor="middle" fill="#024BFF">SCREEN</text>
                </g>
                {/* ASSESS */}
                <g transform="translate(128, 58)">
                  <rect width="50" height="46" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1" />
                  <circle cx="25" cy="16" r="8" fill="none" stroke="#024BFF" strokeWidth="1.2" />
                  <polyline points="21,16 24,19 29,13" stroke="#024BFF" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="25" y="37" textAnchor="middle" fill="#024BFF">ASSESS</text>
                </g>
                {/* INTERVIEW */}
                <g transform="translate(184, 58)">
                  <rect width="50" height="46" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1" />
                  <rect x="16" y="10" width="14" height="10" rx="1.5" fill="none" stroke="#024BFF" strokeWidth="1" />
                  <polygon points="30,13 34,11 34,19 30,17" fill="#024BFF" opacity=".7" />
                  <circle cx="20" cy="14" r="1.2" fill="#024BFF" />
                  <text x="25" y="37" textAnchor="middle" fill="#024BFF">INTERVIEW</text>
                </g>
                {/* SELECTED */}
                <g transform="translate(240, 58)">
                  <rect width="64" height="46" rx="6" fill="#024BFF" stroke="#024BFF" />
                  <circle cx="32" cy="16" r="8" fill="rgba(255,255,255,.18)" />
                  <polyline points="28,16 31,19 36,13" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="32" y="37" textAnchor="middle" fill="#fff">SELECTED</text>
                </g>
                {/* Connectors */}
                <g stroke="rgba(2,75,255,.45)" strokeWidth="1.2" fill="none">
                  <line x1="66" y1="81" x2="72" y2="81" strokeDasharray="2 2"><animate attributeName="strokeDashoffset" from="8" to="0" dur="1.2s" repeatCount="indefinite" /></line>
                  <line x1="122" y1="81" x2="128" y2="81" strokeDasharray="2 2"><animate attributeName="strokeDashoffset" from="8" to="0" dur="1.2s" begin=".2s" repeatCount="indefinite" /></line>
                  <line x1="178" y1="81" x2="184" y2="81" strokeDasharray="2 2"><animate attributeName="strokeDashoffset" from="8" to="0" dur="1.2s" begin=".4s" repeatCount="indefinite" /></line>
                  <line x1="234" y1="81" x2="240" y2="81" strokeDasharray="2 2"><animate attributeName="strokeDashoffset" from="8" to="0" dur="1.2s" begin=".6s" repeatCount="indefinite" /></line>
                </g>
              </g>

              {/* Decision-Ready Report */}
              <g transform="translate(16, 116)">
                <rect width="140" height="64" rx="6" fill="#fff" stroke="rgba(2,75,255,.18)" strokeWidth="1" />
                <text x="8" y="12" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700" fill="#024BFF">DECISION-READY REPORT</text>
                <line x1="8" y1="16" x2="132" y2="16" stroke="rgba(2,75,255,.1)" strokeWidth=".6" />
                <g fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.5)">
                  <text x="8" y="26">CV Strength</text>
                  <rect x="70" y="22" width="56" height="4" rx="2" fill="rgba(2,75,255,.08)" />
                  <rect x="70" y="22" width="50" height="4" rx="2" fill="url(#lpRrGrad)"><animate attributeName="width" from="0" to="50" dur="1.4s" fill="freeze" /></rect>
                  <text x="8" y="36">Coding Score</text>
                  <rect x="70" y="32" width="56" height="4" rx="2" fill="rgba(2,75,255,.08)" />
                  <rect x="70" y="32" width="44" height="4" rx="2" fill="url(#lpRrGrad)"><animate attributeName="width" from="0" to="44" dur="1.5s" begin=".1s" fill="freeze" /></rect>
                  <text x="8" y="46">Interview</text>
                  <rect x="70" y="42" width="56" height="4" rx="2" fill="rgba(2,75,255,.08)" />
                  <rect x="70" y="42" width="52" height="4" rx="2" fill="url(#lpRrGrad)"><animate attributeName="width" from="0" to="52" dur="1.6s" begin=".2s" fill="freeze" /></rect>
                  <text x="8" y="56">Talent Fit</text>
                  <rect x="70" y="52" width="56" height="4" rx="2" fill="rgba(2,75,255,.08)" />
                  <rect x="70" y="52" width="48" height="4" rx="2" fill="url(#lpRrGrad)"><animate attributeName="width" from="0" to="48" dur="1.7s" begin=".3s" fill="freeze" /></rect>
                </g>
              </g>

              {/* Market Benchmarking */}
              <g transform="translate(164, 116)">
                <rect width="140" height="64" rx="6" fill="#fff" stroke="rgba(2,75,255,.18)" strokeWidth="1" />
                <text x="8" y="12" fontFamily="DM Sans,sans-serif" fontSize="5.5" fontWeight="700" fill="#024BFF">MARKET BENCHMARKING</text>
                <line x1="8" y1="16" x2="132" y2="16" stroke="rgba(2,75,255,.1)" strokeWidth=".6" />
                <polyline points="10,50 26,42 42,46 58,34 74,38 90,26 106,30 122,20 130,24" stroke="#024BFF" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="10,50 26,42 42,46 58,34 74,38 90,26 106,30 122,20 130,24 130,58 10,58" fill="url(#lpRrGrad)" opacity=".15" />
                <circle cx="122" cy="20" r="2.5" fill="#024BFF"><animate attributeName="opacity" values=".5;1;.5" dur="1.8s" repeatCount="indefinite" /></circle>
                <text x="8" y="28" fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.45)">Salary insights · Talent availability</text>
              </g>
            </svg>
          </div>
          <span className="lp-engage-badge lp-engage-badge-dark">AI RECRUITMENT SERVICE</span>
          <div className="lp-engage-card-title">Zep Recruit</div>
          <div className="lp-engage-card-desc">Entrust us with your hiring mandate and let our full-stack AI-powered TA platform, backed by expert recruiters, manage the entire process. From intelligent sourcing and CV screening to tailored assessments and structured interviews, we deliver decision-ready candidate reports with deep insights and real-time market benchmarks—enabling faster, smarter hiring than traditional approaches.</div>
          <ul className="lp-engage-card-features">
            <li>End-to-end hiring management—from sourcing to final selection</li>
            <li>AI-driven candidate screening for faster, higher-quality shortlists</li>
            <li>Customized assessments and structured interview workflows</li>
            <li>Decision-ready talent reports with deep evaluation insights</li>
            <li>Real-time market intelligence and benchmarking for smarter hiring decisions</li>
          </ul>
        </div>

      </div>
    </section>
  );
};

export default LandingEngagement;
