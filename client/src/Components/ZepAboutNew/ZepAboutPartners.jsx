import React, { useEffect } from 'react';

const ZepAboutPartners = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepAboutPartners-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  useEffect(() => {
    const track = document.getElementById('teamTrack');
    const dots = document.querySelectorAll('.team-dot');
    let current = 0;
    const cardW = 260;
    function goTo(n) {
        current = Math.max(0, Math.min(n, 4));
        if (track) {
            track.style.transform = `translateX(-${current * cardW}px)`;
            track.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1)';
        }
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }
    const nextBtn = document.getElementById('teamNext');
    const prevBtn = document.getElementById('teamPrev');
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    return () => {
        // Cleanup not strictly necessary as DOM unmounts, but good practice
        if (nextBtn) nextBtn.replaceWith(nextBtn.cloneNode(true));
        if (prevBtn) prevBtn.replaceWith(prevBtn.cloneNode(true));
        dots.forEach(d => d.replaceWith(d.cloneNode(true)));
    };
  }, []);
  return (
    <div id="ZepAboutPartners-root" className="zep-about-page">
      <section className="partners">
  <div className="partners-header reveal">
    <h2>Partnered with most of the<br /><em>top people at each industry</em></h2>
  </div>
  <div className="team-track-wrap reveal">
    <div className="team-track" id="teamTrack">

      <div className="team-card">
        <div className="team-card-avatar">
          <div className="team-card-avatar-bg" style={{background: 'linear-gradient(135deg,#1a1d2e,#0d1020)'}}>👤</div>
          <div className="team-card-overlay"></div>
        </div>
        <div className="team-card-body">
          <div className="team-card-name">Yomi Denzel</div>
          <div className="team-card-role">Chief Executive Officer</div>
          <div className="team-card-desc">Visionary leader building the future of AI-powered recruitment at global scale.</div>
          <div className="team-card-socials">
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg></div>
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/></svg></div>
          </div>
        </div>
      </div>

      <div className="team-card featured">
        <div className="team-card-avatar">
          <div className="team-card-avatar-bg" style={{background: 'linear-gradient(135deg,#024BFF,#1a5aff)'}}>👤</div>
          <div className="team-card-overlay"></div>
          <div className="team-card-tag">Leadership</div>
        </div>
        <div className="team-card-body">
          <div className="team-card-name">Timothée Moiroux</div>
          <div className="team-card-role">Chief Technology Officer</div>
          <div className="team-card-desc">Building the AI systems and infrastructure that power Zepul's recruitment intelligence platform.</div>
          <div className="team-card-socials">
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg></div>
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></div>
          </div>
        </div>
      </div>

      <div className="team-card">
        <div className="team-card-avatar">
          <div className="team-card-avatar-bg" style={{background: 'linear-gradient(135deg,#1a1d2e,#161824)'}}>👤</div>
          <div className="team-card-overlay"></div>
        </div>
        <div className="team-card-body">
          <div className="team-card-name">David Sequiera</div>
          <div className="team-card-role">Head of Talent Operations</div>
          <div className="team-card-desc">Orchestrating global recruitment delivery with precision, speed, and AI-driven intelligence.</div>
          <div className="team-card-socials">
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg></div>
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/></svg></div>
          </div>
        </div>
      </div>

      <div className="team-card">
        <div className="team-card-avatar">
          <div className="team-card-avatar-bg" style={{background: 'linear-gradient(135deg,#1a1d2e,#0d1020)'}}>👤</div>
          <div className="team-card-overlay"></div>
        </div>
        <div className="team-card-body">
          <div className="team-card-name">Manuel Ravier</div>
          <div className="team-card-role">VP Sales &amp; Growth</div>
          <div className="team-card-desc">Scaling Zepul's global enterprise partnerships and driving strategic growth across key markets.</div>
          <div className="team-card-socials">
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg></div>
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/></svg></div>
          </div>
        </div>
      </div>

      <div className="team-card">
        <div className="team-card-avatar">
          <div className="team-card-avatar-bg" style={{background: 'linear-gradient(135deg,#024BFF,#0d1020)'}}>👤</div>
          <div className="team-card-overlay"></div>
        </div>
        <div className="team-card-body">
          <div className="team-card-name">Priya Sharma</div>
          <div className="team-card-role">Head of Product</div>
          <div className="team-card-desc">Shaping Zepul's product vision — from ZepDB to Zep Pro Recruiter — into intuitive, powerful experiences.</div>
          <div className="team-card-socials">
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg></div>
            <div className="team-social-dot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/></svg></div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <div className="team-nav reveal">
    <button className="team-nav-btn" id="teamPrev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <button className="team-nav-btn" id="teamNext"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
  </div>
  <div className="team-dots reveal">
    <div className="team-dot active"></div>
    <div className="team-dot"></div>
    <div className="team-dot"></div>
    <div className="team-dot"></div>
    <div className="team-dot"></div>
  </div>
</section>
    </div>
  );
};

export default ZepAboutPartners;
