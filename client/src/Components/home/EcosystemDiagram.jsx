import React, { useEffect, useRef } from 'react';

/**
 * Hero ecosystem diagram: Zepul's agentic AI core linking employers (Zeus),
 * job seekers (Thea) and recruitment partners.
 *
 * The orbit/pulse animation is declarative SMIL inside the SVG, so the only
 * JS here is honouring `prefers-reduced-motion` by pausing the timeline.
 */
const EcosystemDiagram = () => {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        let reduce = false;
        try {
            reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch { /* matchMedia unavailable — keep animations */ }
        if (reduce && typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
    }, []);

    return (
        <div className="art">
        <svg ref={svgRef} className="diagram" viewBox="50 36 700 792" role="img" aria-labelledby="z1-dTitle z1-dDesc" xmlns="http://www.w3.org/2000/svg">
          <title id="z1-dTitle">The Zepul ecosystem</title>
          <desc id="z1-dDesc">Zepul's agentic AI at the centre connects employers through Zeus, the AI hiring agent, job seekers through Thea, the AI career partner, and recruitment partners.</desc>
          <defs>
            <marker id="z1-arrow" viewBox="0 0 12 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path className="ring-fill" d="M0,0 L12,5 L0,10 L2.5,5 z" />
            </marker>
          </defs>

          {/* faint orbit */}
          <circle cx="400" cy="432" r="262" fill="none" className="ring-faint" strokeWidth="1.5" />

          {/* revolving arcs */}
          <g fill="none" className="ring" strokeWidth="3" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 400 432" to="360 400 432" dur="40s" repeatCount="indefinite" />
            <path d="M140.5,468.5 A262,262 0 0,1 372.6,171.4" markerEnd="url(#z1-arrow)" />
            <path d="M660.6,404.6 A262,262 0 0,1 427.4,692.6" markerEnd="url(#z1-arrow)" />
          </g>

          {/* blinking nodes */}
          <g>
            <circle cx="214.7" cy="246.7" r="6" fill="none" stroke="#0A4DFF" strokeWidth="1.5" opacity="0">
              <animate attributeName="r" values="6;18" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="214.7" cy="246.7" r="6" className="ring-fill">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="585.3" cy="617.3" r="6" fill="none" stroke="#0A4DFF" strokeWidth="1.5" opacity="0">
              <animate attributeName="r" values="6;18" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="585.3" cy="617.3" r="6" className="ring-fill">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="214.7" cy="617.3" r="6" fill="none" stroke="#0A4DFF" strokeWidth="1.5" opacity="0">
              <animate attributeName="r" values="6;18" dur="2.4s" begin="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="2.4s" begin="1.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="214.7" cy="617.3" r="6" className="ring-fill">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" begin="1.6s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* centre with Zepul mark */}
          <circle cx="400" cy="432" r="124" className="halo" />
          <circle cx="400" cy="432" r="108" className="surface" stroke="#0A4DFF" strokeWidth="2.5" />
          <g transform="translate(401 431)" fill="none" strokeWidth="3" strokeLinecap="butt" strokeLinejoin="miter">
            <path className="logo-ink" d="M-13.5,-13.3 L-37.5,-37 A46,46 0 0,1 37.5,-37 L0,0" />
            <path stroke="#0A4DFF" d="M0,0 L-37.5,37 A46,46 0 0,0 37.5,37 L13.5,13.3" />
          </g>

          {/* Agentic AI */}
          <g transform="translate(588 245)">
            <circle r="85" fill="#0A4DFF" opacity="0">
              <animate attributeName="opacity" values="0;0.12;0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="r" values="85;97;85" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle r="85" className="ai-node" strokeWidth="1.5" />
            <text y="-22" textAnchor="middle" className="ai-label">Agentic AI</text>
            <g transform="translate(0 18)" stroke="#0A4DFF" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <rect x="-13" y="-13" width="26" height="26" rx="5" />
              <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="#0A4DFF" stroke="none">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
              </rect>
              <path d="M-6,-17 v-3 M0,-17 v-3 M6,-17 v-3 M-6,17 v3 M0,17 v3 M6,17 v3 M-17,-6 h-3 M-17,0 h-3 M-17,6 h-3 M17,-6 h3 M17,0 h3 M17,6 h3" />
            </g>
          </g>

          {/* Employers + Zeus */}
          <image href="/assets/zeus-agent.png" x="70" y="48" width="84" height="72" />
          <text x="82" y="137" className="agent-label">Zeus - AI Hiring Agent</text>
          <rect x="72" y="153" width="173" height="68" rx="10" fill="#0A4DFF" />
          <g transform="translate(110 187)" stroke="#FFFFFF" strokeWidth="1.6" fill="none" strokeLinejoin="round">
            <rect x="-7" y="-8" width="14" height="16" rx="1.5" />
            <path d="M-3.5,-4 h2 M1.5,-4 h2 M-3.5,0.5 h2 M1.5,0.5 h2 M-2,8 v-3.5 h4 v3.5" />
          </g>
          <text x="133" y="193" className="card-label">Employers</text>

          {/* Job Seekers + Thea */}
          <rect x="72" y="641" width="173" height="68" rx="10" fill="#0A4DFF" />
          <g transform="translate(104 675)" stroke="#FFFFFF" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <circle cx="0" cy="-3.5" r="3.8" />
            <path d="M-7,8 C-7,2 7,2 7,8" />
          </g>
          <text x="126" y="681" className="card-label">Job Seekers</text>
          <image href="/assets/thea-agent.png" x="72" y="716" width="72" height="70" />
          <text x="82" y="808" className="agent-label">Thea - AI Career Partner</text>

          {/* Recruitment Partners + circuit */}
          <g fill="none" stroke="#3A3F4F" strokeWidth="1" strokeLinecap="round" opacity="0.85">
            <path d="M560,592 H600 L608,600 H676" />
            <path d="M572,602 H598 L606,610 H676" />
            <path d="M556,612 H596 L604,620 H676" />
            <path d="M566,622 H592 L600,630 H640" />
            <path d="M610,582 H650 L660,592 H676" />
            <circle cx="560" cy="592" r="2" fill="#3A3F4F" /><circle cx="572" cy="602" r="2" fill="#3A3F4F" />
            <circle cx="556" cy="612" r="2" fill="#3A3F4F" /><circle cx="566" cy="622" r="2" fill="#3A3F4F" />
            <circle cx="610" cy="582" r="2" fill="#3A3F4F" /><circle cx="640" cy="630" r="2" fill="#3A3F4F" />
            <path d="M680,582 a14,14 0 0 1 22,-6 a12,12 0 0 1 20,10 a10,10 0 0 1 -2,20 v8 M680,582 a10,10 0 0 0 -2,20" />
            <rect x="684" y="588" width="30" height="26" rx="4" fill="var(--surface)" />
            <path d="M690,614 v5 M699,614 v5 M708,614 v5" />
          </g>
          <text x="699" y="605" textAnchor="middle" fontSize="11" fontWeight="600" fill="#3A3F4F">AI</text>
          <rect x="558" y="641" width="173" height="68" rx="10" fill="#0A4DFF" />
          <g transform="translate(590 675)" stroke="#FFFFFF" strokeWidth="1.5" fill="none">
            <circle cx="4.5" cy="-5.5" r="2.6" /><circle cx="4.5" cy="5.5" r="2.6" /><circle cx="-4.5" cy="0" r="2.6" />
            <path d="M-2.2,-1.3 L2.2,-4.2 M-2.2,1.3 L2.2,4.2" />
          </g>
          <text x="614" y="670" className="card-label">Recruitment</text>
          <text x="614" y="690" className="card-label">Partners</text>
        </svg>
        </div>
    );
};

export default EcosystemDiagram;
