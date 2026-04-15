import React, { useEffect } from 'react';

const ZepAboutFAQ = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepAboutFAQ-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  useEffect(() => {
    const qs = document.querySelectorAll('.faq-q');
    const handler = (e) => {
        const q = e.currentTarget;
        const item = q.parentElement;
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    };
    qs.forEach(q => q.addEventListener('click', handler));
    return () => qs.forEach(q => q.removeEventListener('click', handler));
  }, []);
  return (
    <div id="ZepAboutFAQ-root" className="zep-about-page">
      <section className="faq">
  <div className="faq-header reveal">
    <div className="faq-pre">FAQs</div>
    <h2>Frequently asked questions</h2>
    <p>Here are some common questions about our services to help you understand better.</p>
  </div>
  <div className="faq-grid reveal">
    {/*  Col 1  */}
    <div className="faq-col">
      <div className="faq-item open">
        <div className="faq-q">What is Zep Recruit?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Zep Recruit is our AI-powered recruitment service where Zepul handles the entire hiring process — from demand forecasting, sourcing, and CV ranking to coding tests, AI interviews, and delivering decision-ready report cards. You get top talent without the overhead.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q">How does the AI Interview work?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Our AI conducts fully automated, structured interviews — asking role-specific questions, evaluating responses in real-time, and generating a comprehensive summary with scoring. Either 100% AI or optionally supplemented with human validation.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q">Do you charge job seekers?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Never. Zepul and its partners, authorized vendors, and subsidiaries do not charge any fees from job seekers for employment placements. If anyone claims otherwise, please report such violations immediately.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q">Can Zepul scale with our hiring volume?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Yes. Our global on-demand recruiter network and AI infrastructure are designed to scale from a single hire to hundreds per month. The more you hire, the smarter our models become for your specific roles.</div>
      </div>
    </div>
    {/*  Col 2  */}
    <div className="faq-col">
      <div className="faq-item">
        <div className="faq-q">What is the Zep Pro Recruiter product?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Zep Pro Recruiter is our SaaS platform for in-house teams. It gives your recruiters a unified dashboard to source, screen, code-test, interview, and track candidates — with full AI intelligence and real-time analytics built in.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q">What does a Report Card include?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Each report card is a decision-ready candidate summary covering CV Strength, Talent Rank, Coding Performance, Interview Summary, and Complete Profile — all in one unified document designed to eliminate back-and-forth.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q">Where does Zepul operate?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Zepul has its Product HQ in London, UK and Services HQ in Hyderabad, India. Our global recruiter network spans multiple countries, allowing us to source and place talent across geographies.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q">How do I get started?<div className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div>
        <div className="faq-a">Book a demo via our website or reach out directly at support@zepul.com. Our team will understand your hiring goals and recommend the right engagement model — Zep Recruit, Zep Pro Recruiter, or a custom enterprise arrangement.</div>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default ZepAboutFAQ;
