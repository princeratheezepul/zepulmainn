import React from 'react';

const LandingHowItWorks = () => {
    return (
        <section className="lp-system-canvas lp-reveal">
            <h2 className="lp-section-head">How <span className="lp-blue">Zepul</span> Works</h2>
            <p className="lp-section-sub">A system-level view of our AI-powered recruitment pipeline.</p>

            <div className="lp-sc-scroll-wrapper">
                <div className="lp-sc-flow lp-reveal">

                    {/* LEFT: Dual path inputs */}
                    <div className="lp-sc-inputs">
                        {/* Path 1 */}
                        <div className="lp-sc-path">
                            <div className="lp-sc-path-tag lp-blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                PATH 1
                            </div>
                            <div className="lp-sc-path-title">Outsource to Zepul</div>
                            <div className="lp-sc-path-desc">Zepul will forecast, plan, and deploy for you.</div>
                        </div>
                        <div className="lp-sc-ext-chips">
                            <div className="lp-sc-ext-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                                Market Based Talent by Zep Recruit
                            </div>
                            <div className="lp-sc-ext-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg>
                                Performance &amp; Dashboard
                            </div>
                        </div>

                        {/* Path 2 */}
                        <div className="lp-sc-path">
                            <div className="lp-sc-path-tag lp-outline">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                PATH 2
                            </div>
                            <div className="lp-sc-path-title">DIY with ZepPro Recruiter</div>
                            <div className="lp-sc-path-desc">Manage recruitment independently using platform tools.</div>
                        </div>
                        <div className="lp-sc-ext-chips">
                            <div className="lp-sc-ext-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg>
                                Dashboard
                            </div>
                            <div className="lp-sc-ext-chip">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                Recruitment Platform
                            </div>
                        </div>
                    </div>

                    {/* MERGE connector */}
                    <div className="lp-sc-merge">
                        <svg viewBox="0 0 44 200" fill="none" preserveAspectRatio="none">
                            <path d="M4 55 C22 55 22 100 22 100" stroke="#024BFF" strokeWidth="2.5" fill="none" opacity=".5" />
                            <path d="M4 145 C22 145 22 100 22 100" stroke="#024BFF" strokeWidth="2.5" fill="none" opacity=".5" />
                            <line x1="22" y1="100" x2="40" y2="100" stroke="#024BFF" strokeWidth="2.5" opacity=".5" />
                            <polygon points="40,100 32,94 32,106" fill="#024BFF" opacity=".5" />
                        </svg>
                    </div>

                    {/* MAIN PIPELINE */}
                    <div className="lp-sc-pipeline-main">

                        {/* 1. Planning Pipeline */}
                        <div className="lp-sc-stage">
                            <div className="lp-sc-stage-group">
                                <div className="lp-sc-stage-group-title">Planning Pipeline</div>
                                <div className="lp-sc-node">
                                    <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    <div className="lp-sc-node-label">Forecast</div>
                                </div>
                                <div className="lp-sc-node">
                                    <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                                    <div className="lp-sc-node-label">Plan</div>
                                </div>
                                <div className="lp-sc-node">
                                    <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                    <div className="lp-sc-node-label">Deploy</div>
                                </div>
                            </div>
                        </div>

                        <div className="lp-sc-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></div>

                        {/* ZepDB BLOCK */}
                        <div className="lp-sc-zepdb-block">
                            <div className="lp-sc-zepdb-core">
                                <div className="lp-sc-zepdb-core-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                                </div>
                                <div>
                                    <div className="lp-sc-zepdb-core-label">ZepDB</div>
                                    <div className="lp-sc-zepdb-core-sub">Unified Data Layer</div>
                                </div>
                            </div>
                            <div className="lp-sc-zepdb-below">
                                <div className="lp-sc-zepdb-v-line"></div>
                                <div className="lp-sc-aspiration">
                                    <div className="lp-sc-aspiration-title">Understand Candidate<br />Aspiration</div>
                                    <div className="lp-sc-aspiration-items">
                                        <div className="lp-sc-aspiration-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                            Scan &amp; Match Opportunity
                                        </div>
                                        <div className="lp-sc-aspiration-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                                            Upskill
                                        </div>
                                        <div className="lp-sc-aspiration-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                                            Connect with Employers
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lp-sc-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></div>

                        {/* 2. AI-Driven Multi-Channel Sourcing */}
                        <div className="lp-sc-stage">
                            <div className="lp-sc-node">
                                <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                <div className="lp-sc-node-label">AI-Driven<br />Multi-Channel<br />Sourcing</div>
                                <div className="lp-sc-node-sub">Database Discovery</div>
                            </div>
                        </div>

                        <div className="lp-sc-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></div>

                        {/* 3. AI-Powered Evaluation */}
                        <div className="lp-sc-stage">
                            <div className="lp-sc-stage-group">
                                <div className="lp-sc-stage-group-title">AI-Powered Evaluation</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <div className="lp-sc-node">
                                        <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                                        <div className="lp-sc-node-label">CV Rank<br />+ Match</div>
                                    </div>
                                    <div className="lp-sc-node">
                                        <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                        <div className="lp-sc-node-label">Dynamic<br />Coding Test</div>
                                    </div>
                                    <div className="lp-sc-node">
                                        <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                        <div className="lp-sc-node-label">AI Interview<br />(100%)</div>
                                    </div>
                                    <div className="lp-sc-node">
                                        <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        <div className="lp-sc-node-label">Human<br />Interview</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lp-sc-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></div>

                        {/* 4. Assessment & Validation */}
                        <div className="lp-sc-stage">
                            <div className="lp-sc-stage-group">
                                <div className="lp-sc-stage-group-title">Assessment &amp; Validation</div>
                                <div className="lp-sc-node">
                                    <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    <div className="lp-sc-node-label">AI Assessment</div>
                                </div>
                                <div className="lp-sc-node">
                                    <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                                    <div className="lp-sc-node-label">Human Validation</div>
                                </div>
                            </div>
                        </div>

                        <div className="lp-sc-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></div>

                        {/* 5–7: VERTICAL END COLUMN */}
                        <div className="lp-sc-end-col">
                            <div className="lp-sc-node">
                                <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                <div className="lp-sc-node-label">Report Card</div>
                                <div className="lp-sc-node-sub">Analytics</div>
                            </div>
                            <div className="lp-sc-v-arrow"></div>
                            <div className="lp-sc-node">
                                <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                <div className="lp-sc-node-label">Interview &amp;<br />Account Mgmt</div>
                                <div className="lp-sc-node-sub">Scheduling</div>
                            </div>
                            <div className="lp-sc-v-arrow"></div>
                            <div className="lp-sc-node lp-highlight">
                                <svg className="lp-sc-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fff', opacity: 1 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <div className="lp-sc-node-label">Right<br />Candidate<br />Hired</div>
                                <div className="lp-sc-node-sub">Onboarding</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingHowItWorks;
