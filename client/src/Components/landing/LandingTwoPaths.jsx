import React from 'react';

const LandingTwoPaths = () => {
    return (
        <section className="lp-paths lp-section-pad">
            <div className="lp-paths-canvas lp-reveal">

                {/* LEFT: heading + CTA */}
                <div className="lp-paths-left">
                    <h2 className="lp-section-head">One goal: great hires.<br />Two ways to get there.</h2>
                    <div className="lp-paths-bottom">
                        <p className="lp-section-sub"><span className="lp-blue">Choose your way ....</span></p>
                        <div className="lp-paths-cta-wrap">
                            <button className="lp-paths-cta">
                                Talk to us
                                <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 5.5h7M6 2.5l3 3-3 3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: 2 stacked cards */}
                <div className="lp-paths-duo">

                    {/* PATH 1: Zep Recruit */}
                    <div className="lp-pc">
                        <div className="lp-pc-body">
                            <div className="lp-pc-tag lp-blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                ZEP RECRUIT
                            </div>
                            <div className="lp-pc-title">Zep Recruit - AI Recruitment Service</div>
                            <div className="lp-pc-desc">Let us handle the heavy lifting. Our AI-powered platform, combined with expert recruiters, manages the entire hiring process—from AI-driven sourcing and CV assessment to tailored coding tests and structured AI interviews. You receive decision-ready talent reports with detailed evaluations, along with real-time market insights and benchmarking analytics. The result is a faster, more efficient hiring model that consistently outperforms traditional recruitment.</div>
                        </div>
                    </div>

                    {/* PATH 2: Zep Pro Recruit */}
                    <div className="lp-pc">
                        <div className="lp-pc-body">
                            <div className="lp-pc-tag lp-outline">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                ZEP PRO RECRUITER
                            </div>
                            <div className="lp-pc-title">Zep Pro Recruiter - AI Recruitment Product</div>
                            <div className="lp-pc-desc">Empower your recruiters with a unified, AI-driven platform to source talent, assess CV strength, run dynamic coding assessments, and conduct fully automated interviews—generating comprehensive, decision-ready report cards in one place. Real-time dashboards provide complete visibility into recruiter and business performance. The result: more productive recruiters, higher-quality hires, and significantly reduced time and cost to hire.</div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default LandingTwoPaths;
