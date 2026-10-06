import React from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

// Seeded scatter of "job seeker" dots, so the cluster looks the same on every render.
const buildClusters = (specs) => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return specs.map(([cx, cy, radius, count]) => {
    const dots = [];
    for (let k = 0; k < count; k++) {
      const ang = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * radius;
      const dot = {
        cx: (cx + Math.cos(ang) * d).toFixed(1),
        cy: (cy + Math.sin(ang) * d * 0.8).toFixed(1),
        r: (2.2 + rnd() * 2).toFixed(1),
        highlight: k % 4 === 0,
      };
      if (dot.highlight) dot.dur = (2 + rnd() * 2).toFixed(1) + "s";
      dots.push(dot);
    }
    return dots;
  });
};

const [DESK_DOTS, MOBILE_DOTS] = buildClusters([
  [115, 228, 82, 30],
  [180, 64, 96, 26],
]);

const ClusterDots = ({ dots, animate }) => (
  <g>
    {dots.map((d, i) => (
      <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.highlight ? "#0FA38E" : "#C7CCDA"}>
        {animate && d.highlight && (
          <animate attributeName="opacity" values="1;.3;1" dur={d.dur} repeatCount="indefinite" />
        )}
      </circle>
    ))}
  </g>
);

const ZplThea = () => {
  const reduce = usePrefersReducedMotion();

  return (
    <div className="zp-zs3">
    <section id="thea"><div className="zp-wrap">
  
      <div className="zp-head"><div><span className="zp-eyebrow">Zeus works with Thea</span><h2>Zeus doesn’t just search. <em>It connects with other intelligent sourcing.</em></h2></div><p className="zp-lede">Beyond databases, Zeus works with Thea, Zepul’s AI career partner for job seekers.</p></div>
      <div className="zp-net">
        <svg className="zp-desk" viewBox="0 0 1000 400" role="img" aria-label="Job seekers talk with Thea. Thea and Zeus exchange candidates and opportunities. Zeus also searches Zep DB and delivers a shortlist to your role.">
          <ClusterDots dots={DESK_DOTS} animate={!reduce} />
          <text x="115" y="352" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="1.4" fill="#5E6477">JOB SEEKERS</text>
          <g stroke="#0FA38E" strokeOpacity=".3"><line x1="160" y1="200" x2="278" y2="230" /><line x1="175" y1="240" x2="278" y2="230" /><line x1="150" y1="270" x2="278" y2="230" /></g>
          <circle cx="330" cy="230" r="76" fill="#E8F7F4" />
          <circle cx="330" cy="230" r="52" fill="#0FA38E" />
          <text x="330" y="234" textAnchor="middle" fontFamily="Lora, Georgia, serif" fontSize="24" fill="#FFFFFF">Thea</text>
          <text x="330" y="252" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" letterSpacing="1.4" fill="#D5F7F1">CAREER PARTNER</text>
          <g fontSize="11" fill="#111318" style={{ fontFamily: "Inter, sans-serif" }}><rect x="250" y="322" width="160" height="22" rx="11.0" fill="#E8F7F4" /><circle cx="261" cy="333.0" r="3" fill="#0FA38E" /><text x="271" y="337.0">Talks with candidates</text><rect x="250" y="350" width="160" height="22" rx="11.0" fill="#E8F7F4" /><circle cx="261" cy="361.0" r="3" fill="#0FA38E" /><text x="271" y="365.0">Global opportunities</text><rect x="250" y="378" width="160" height="22" rx="11.0" fill="#E8F7F4" /><circle cx="261" cy="389.0" r="3" fill="#0FA38E" /><text x="271" y="393.0">Upskilling</text></g>
          <g fontSize="11" fill="#111318" style={{ fontFamily: "Inter, sans-serif" }}><rect x="580" y="322" width="180" height="22" rx="11.0" fill="#EEF3FF" /><circle cx="591" cy="333.0" r="3" fill="#0A4DFF" /><text x="601" y="337.0">Understands the role</text><rect x="580" y="350" width="180" height="22" rx="11.0" fill="#EEF3FF" /><circle cx="591" cy="361.0" r="3" fill="#0A4DFF" /><text x="601" y="365.0">Searches 800M+ in Zep DB</text><rect x="580" y="378" width="180" height="22" rx="11.0" fill="#EEF3FF" /><circle cx="591" cy="389.0" r="3" fill="#0A4DFF" /><text x="601" y="393.0">Connects with Thea</text></g>
          <path id="zp-nTZ" d="M406 222 L 594 222" fill="none" stroke="#D4D9E5" />
          <path id="zp-nZT" d="M594 238 L 406 238" fill="none" stroke="#D4D9E5" />
          <text x="500" y="200" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" letterSpacing="1.4" fill="#111318">ZEPUL’S OWN NETWORK</text>
          <text x="500" y="268" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#0FA38E">prepared candidates →</text>
          <text x="500" y="286" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#0A4DFF">← open opportunities</text>
          <rect x="590" y="22" width="160" height="62" fill="#FFFFFF" stroke="#D4D9E5" />
          <text x="670" y="46" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="1.4" fill="#0A4DFF">ZEP DB</text>
          <text x="670" y="68" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#111318">800M+ global profiles</text>
          <path id="zp-nDZ" d="M670 84 L 670 158" fill="none" stroke="#D4D9E5" />
          <circle cx="670" cy="230" r="86" fill="#EEF3FF" />
          <circle cx="670" cy="230" r="62" fill="#0A4DFF" />
          <text x="670" y="234" textAnchor="middle" fontFamily="Lora, Georgia, serif" fontSize="28" fill="#FFFFFF">Zeus</text>
          <text x="670" y="253" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" letterSpacing="1.4" fill="#C9D7FF">HIRING PARTNER</text>
          <path id="zp-nZR" d="M756 230 L 830 230" fill="none" stroke="#D4D9E5" />
          <rect x="830" y="186" width="168" height="88" fill="#FFFFFF" stroke="#0A4DFF" />
          <text x="846" y="210" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="1.4" fill="#0A4DFF">YOUR ROLE</text>
          <text x="846" y="234" fontFamily="Inter, sans-serif" fontSize="13.5" fontWeight="600" fill="#111318">Shortlist +</text>
          <text x="846" y="254" fontFamily="Inter, sans-serif" fontSize="13.5" fontWeight="600" fill="#111318">scorecards</text>
          <circle r="4" fill="#0FA38E"><animateMotion dur="2.2s" repeatCount="indefinite"><mpath href="#zp-nTZ" /></animateMotion></circle>
          <circle r="4" fill="#0FA38E"><animateMotion dur="2.2s" begin="-1.1s" repeatCount="indefinite"><mpath href="#zp-nTZ" /></animateMotion></circle>
          <circle r="4" fill="#0A4DFF"><animateMotion dur="2.6s" begin="-.5s" repeatCount="indefinite"><mpath href="#zp-nZT" /></animateMotion></circle>
          <circle r="3.5" fill="#0A4DFF"><animateMotion dur="1.6s" repeatCount="indefinite"><mpath href="#zp-nDZ" /></animateMotion></circle>
          <circle r="3.5" fill="#0A4DFF"><animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#zp-nZR" /></animateMotion></circle>
        </svg>
        <svg className="zp-mob" viewBox="0 0 360 720" role="img" aria-label="Job seekers talk with Thea. Thea and Zeus exchange candidates and opportunities. Zeus also searches Zep DB and delivers a shortlist to your role.">
          <ClusterDots dots={MOBILE_DOTS} animate={!reduce} />
          <text x="180" y="132" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="1.4" fill="#5E6477">JOB SEEKERS</text>
          <path d="M180 140 L 180 186" stroke="#D4D9E5" />
          <circle cx="180" cy="236" r="50" fill="#0FA38E" />
          <text x="180" y="240" textAnchor="middle" fontFamily="Lora, Georgia, serif" fontSize="24" fill="#FFFFFF">Thea</text>
          <text x="180" y="258" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" letterSpacing="1.4" fill="#D5F7F1">CAREER PARTNER</text>
          <g fontSize="10" fill="#111318" style={{ fontFamily: "Inter, sans-serif" }}><rect x="236" y="206" width="122" height="20" rx="10.0" fill="#E8F7F4" /><circle cx="247" cy="216.0" r="3" fill="#0FA38E" /><text x="257" y="219.6">Talks to candidates</text><rect x="236" y="232" width="122" height="20" rx="10.0" fill="#E8F7F4" /><circle cx="247" cy="242.0" r="3" fill="#0FA38E" /><text x="257" y="245.6">Global roles</text><rect x="236" y="258" width="122" height="20" rx="10.0" fill="#E8F7F4" /><circle cx="247" cy="268.0" r="3" fill="#0FA38E" /><text x="257" y="271.6">Upskilling</text></g>
          <g fontSize="10" fill="#111318" style={{ fontFamily: "Inter, sans-serif" }}><rect x="2" y="432" width="116" height="20" rx="10.0" fill="#EEF3FF" /><circle cx="13" cy="442.0" r="3" fill="#0A4DFF" /><text x="23" y="445.6">Understands role</text><rect x="2" y="458" width="116" height="20" rx="10.0" fill="#EEF3FF" /><circle cx="13" cy="468.0" r="3" fill="#0A4DFF" /><text x="23" y="471.6">800M+ Zep DB</text><rect x="2" y="484" width="116" height="20" rx="10.0" fill="#EEF3FF" /><circle cx="13" cy="494.0" r="3" fill="#0A4DFF" /><text x="23" y="497.6">Thea network</text></g>
          <path id="zp-mTZ" d="M172 288 L 172 404" stroke="#D4D9E5" fill="none" />
          <path id="zp-mZT" d="M188 404 L 188 288" stroke="#D4D9E5" fill="none" />
          <text x="160" y="340" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11.5" fill="#0FA38E">prepared</text>
          <text x="160" y="355" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11.5" fill="#0FA38E">candidates ↓</text>
          <text x="200" y="340" fontFamily="Inter, sans-serif" fontSize="11.5" fill="#0A4DFF">↑ open</text>
          <text x="200" y="355" fontFamily="Inter, sans-serif" fontSize="11.5" fill="#0A4DFF">opportunities</text>
          <text x="180" y="384" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" letterSpacing="1.2" fill="#111318">ZEPUL’S OWN NETWORK</text>
          <circle cx="180" cy="462" r="58" fill="#0A4DFF" />
          <text x="180" y="466" textAnchor="middle" fontFamily="Lora, Georgia, serif" fontSize="26" fill="#FFFFFF">Zeus</text>
          <text x="180" y="484" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" letterSpacing="1.4" fill="#C9D7FF">HIRING PARTNER</text>
          <rect x="262" y="436" width="96" height="52" fill="#FFFFFF" stroke="#D4D9E5" />
          <text x="310" y="456" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.2" fill="#0A4DFF">ZEP DB</text>
          <text x="310" y="476" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11.5" fill="#111318">800M+ profiles</text>
          <path id="zp-mDZ" d="M262 462 L 238 462" stroke="#D4D9E5" fill="none" />
          <path id="zp-mZR" d="M180 520 L 180 596" stroke="#D4D9E5" fill="none" />
          <rect x="90" y="596" width="180" height="76" fill="#FFFFFF" stroke="#0A4DFF" />
          <text x="180" y="621" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="1.4" fill="#0A4DFF">YOUR ROLE</text>
          <text x="180" y="646" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#111318">Shortlist + scorecards</text>
          <circle r="4" fill="#0FA38E"><animateMotion dur="2.2s" repeatCount="indefinite"><mpath href="#zp-mTZ" /></animateMotion></circle>
          <circle r="4" fill="#0A4DFF"><animateMotion dur="2.6s" begin="-.6s" repeatCount="indefinite"><mpath href="#zp-mZT" /></animateMotion></circle>
          <circle r="3.5" fill="#0A4DFF"><animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#zp-mDZ" /></animateMotion></circle>
          <circle r="3.5" fill="#0A4DFF"><animateMotion dur="1.6s" repeatCount="indefinite"><mpath href="#zp-mZR" /></animateMotion></circle>
        </svg>
      </div>
      <div className="zp-pair">
        <div><span className="zp-who2"><i style={{ background: "var(--teal)" }}></i><span style={{ color: "var(--teal)" }}>Thea · AI career partner</span></span><h3>Understands the person</h3><p>Thea talks with job seekers to understand their skills and aspirations, matches them to global opportunities, and helps them upskill for the roles they want.</p></div>
        <div><span className="zp-who2"><i style={{ background: "var(--blue)" }}></i><span style={{ color: "var(--blue)" }}>Zeus · AI hiring partner</span></span><h3>Understands the role</h3><p>When you open a role, Zeus searches 800M+ global profiles in Zep DB and connects with Thea to reach candidates already in conversation with Zepul: prepared, motivated and actively upskilling.</p></div>
      </div>
      <p className="zp-sig">Two agents, one network. <span>Employers find better-prepared talent. Candidates find the right opportunity.</span></p>
    </div>
    </section>
    </div>
  );
};

export default ZplThea;
