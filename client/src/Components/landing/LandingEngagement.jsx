import React from 'react';

const LandingEngagement = () => {
    return (
        <section className="lp-engage lp-section-pad">
            <h2 className="lp-section-head lp-reveal">Choose Your <span className="lp-blue">Engagement Model</span></h2>
            <p className="lp-section-sub lp-reveal">Flexible, tiered engagement options built for every stage of your hiring journey.</p>

            <div className="lp-engage-grid lp-reveal">

                {/* Card 1: Per Hire */}
                <div className="lp-engage-card">
                    <div className="lp-engage-card-img">
                        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="lpPhGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                                </pattern>
                            </defs>
                            <rect width="320" height="200" fill="url(#lpPhGrid)" />
                            <rect x="44" y="18" width="232" height="160" rx="8" fill="#fff" stroke="rgba(2,75,255,.12)" strokeWidth="1" />
                            <rect x="44" y="18" width="232" height="24" rx="8" fill="rgba(2,75,255,.04)" />
                            <rect x="44" y="40" width="232" height="1.5" fill="rgba(2,75,255,.06)" />
                            <circle cx="59" cy="30" r="2.5" fill="rgba(2,75,255,.15)" />
                            <circle cx="69" cy="30" r="2.5" fill="rgba(2,75,255,.1)" />
                            <circle cx="79" cy="30" r="2.5" fill="rgba(2,75,255,.07)" />
                            <text x="160" y="33" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="7" fontWeight="600" fill="rgba(2,75,255,.45)">Hiring Dashboard</text>
                            <g transform="translate(56, 50)">
                                <rect width="60" height="40" rx="5" fill="rgba(2,75,255,.03)" stroke="rgba(2,75,255,.09)" strokeWidth=".8" />
                                <text x="30" y="13" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6" fill="rgba(12,14,22,.35)">PIPELINE</text>
                                <text x="30" y="31" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="18" fontWeight="700" fill="#024BFF">24</text>
                            </g>
                            <g transform="translate(128, 50)">
                                <rect width="60" height="40" rx="5" fill="rgba(2,75,255,.03)" stroke="rgba(2,75,255,.09)" strokeWidth=".8" />
                                <text x="30" y="13" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6" fill="rgba(12,14,22,.35)">SCREENED</text>
                                <text x="30" y="31" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="18" fontWeight="700" fill="#024BFF">11</text>
                            </g>
                            <g transform="translate(200, 50)">
                                <rect width="60" height="40" rx="5" fill="rgba(16,185,129,.05)" stroke="rgba(16,185,129,.22)" strokeWidth=".8" />
                                <text x="30" y="13" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6" fill="rgba(12,14,22,.35)">HIRED</text>
                                <text x="30" y="31" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="18" fontWeight="700" fill="#10b981">
                                    <animate attributeName="opacity" values=".7;1;.7" dur="2s" repeatCount="indefinite" />3
                                </text>
                            </g>
                            <text x="56" y="110" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(12,14,22,.35)">CANDIDATE STAGES</text>
                            <g transform="translate(56, 122)">
                                <circle cx="6" cy="6" r="5" fill="rgba(2,75,255,.1)" stroke="#024BFF" strokeWidth="1" />
                                <line x1="11" y1="6" x2="39" y2="6" stroke="rgba(2,75,255,.2)" strokeWidth="1" strokeDasharray="3 2">
                                    <animate attributeName="strokeDashoffset" from="10" to="0" dur="1.4s" repeatCount="indefinite" />
                                </line>
                                <circle cx="44" cy="6" r="5" fill="rgba(2,75,255,.1)" stroke="#024BFF" strokeWidth="1" />
                                <line x1="49" y1="6" x2="77" y2="6" stroke="rgba(2,75,255,.2)" strokeWidth="1" strokeDasharray="3 2">
                                    <animate attributeName="strokeDashoffset" from="10" to="0" dur="1.4s" begin=".3s" repeatCount="indefinite" />
                                </line>
                                <circle cx="82" cy="6" r="5" fill="rgba(2,75,255,.1)" stroke="#024BFF" strokeWidth="1" />
                                <line x1="87" y1="6" x2="115" y2="6" stroke="rgba(2,75,255,.2)" strokeWidth="1" strokeDasharray="3 2">
                                    <animate attributeName="strokeDashoffset" from="10" to="0" dur="1.4s" begin=".6s" repeatCount="indefinite" />
                                </line>
                                <circle cx="120" cy="6" r="5" fill="rgba(2,75,255,.1)" stroke="#024BFF" strokeWidth="1" />
                                <line x1="125" y1="6" x2="153" y2="6" stroke="rgba(2,75,255,.2)" strokeWidth="1" strokeDasharray="3 2">
                                    <animate attributeName="strokeDashoffset" from="10" to="0" dur="1.4s" begin=".9s" repeatCount="indefinite" />
                                </line>
                                <circle cx="164" cy="6" r="8" fill="#024BFF">
                                    <animate attributeName="opacity" values=".75;1;.75" dur="2s" repeatCount="indefinite" />
                                </circle>
                                <polyline points="160,6 163,9 169,3" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                <text x="6" y="22" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.3)">Apply</text>
                                <text x="44" y="22" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.3)">Screen</text>
                                <text x="82" y="22" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.3)">Interview</text>
                                <text x="120" y="22" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5" fill="rgba(12,14,22,.3)">Assess</text>
                                <text x="164" y="22" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5" fontWeight="600" fill="#024BFF">Hired</text>
                            </g>
                            <rect x="56" y="158" width="208" height="14" rx="4" fill="rgba(2,75,255,.04)" stroke="rgba(2,75,255,.09)" strokeWidth=".8" />
                            <text x="160" y="168" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fill="rgba(12,14,22,.4)">Pay only on successful hire · No upfront cost</text>
                        </svg>
                    </div>
                    <span className="lp-engage-badge lp-blue">PAY-AS-YOU-GO</span>
                    <div className="lp-engage-card-title">Per Hire Model</div>
                    <div className="lp-engage-card-desc">Ideal for companies with occasional hiring needs. Pay only when you make a successful hire.</div>
                    <ul className="lp-engage-card-features">
                        <li>No upfront commitment</li>
                        <li>AI screening included</li>
                        <li>Dedicated success manager</li>
                        <li>7-day candidate guarantee</li>
                    </ul>
                </div>

                {/* Card 2: Rapid Recruiter */}
                <div className="lp-engage-card">
                    <div className="lp-engage-card-img">
                        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="lpRrGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                                </pattern>
                            </defs>
                            <rect width="320" height="200" fill="url(#lpRrGrid)" />
                            <rect x="20" y="28" width="86" height="148" rx="7" fill="rgba(2,75,255,.03)" stroke="rgba(2,75,255,.1)" strokeWidth=".8" />
                            <text x="63" y="44" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(2,75,255,.5)">ZEPUL TEAM</text>
                            <g transform="translate(33, 56)">
                                <circle cx="14" cy="10" r="10" fill="rgba(2,75,255,.08)" stroke="rgba(2,75,255,.2)" strokeWidth=".8" />
                                <circle cx="14" cy="8" r="4" fill="#024BFF" opacity=".4" />
                                <path d="M7 20a7 7 0 0 1 14 0" stroke="#024BFF" strokeWidth=".8" fill="none" opacity=".4" />
                                <text x="32" y="9" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(12,14,22,.5)">Recruiter</text>
                                <rect x="32" y="13" width="28" height="3" rx="1.5" fill="rgba(2,75,255,.12)" />
                            </g>
                            <g transform="translate(33, 96)">
                                <circle cx="14" cy="10" r="10" fill="rgba(2,75,255,.08)" stroke="rgba(2,75,255,.2)" strokeWidth=".8" />
                                <circle cx="14" cy="8" r="4" fill="#024BFF" opacity=".4" />
                                <path d="M7 20a7 7 0 0 1 14 0" stroke="#024BFF" strokeWidth=".8" fill="none" opacity=".4" />
                                <text x="32" y="9" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(12,14,22,.5)">AI Engine</text>
                                <rect x="32" y="13" width="22" height="3" rx="1.5" fill="rgba(2,75,255,.12)" />
                            </g>
                            <g transform="translate(33, 136)">
                                <circle cx="14" cy="10" r="10" fill="rgba(2,75,255,.08)" stroke="rgba(2,75,255,.2)" strokeWidth=".8" />
                                <circle cx="14" cy="8" r="4" fill="#024BFF" opacity=".4" />
                                <path d="M7 20a7 7 0 0 1 14 0" stroke="#024BFF" strokeWidth=".8" fill="none" opacity=".4" />
                                <text x="32" y="9" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(12,14,22,.5)">Screener</text>
                                <rect x="32" y="13" width="26" height="3" rx="1.5" fill="rgba(2,75,255,.12)" />
                            </g>
                            <text x="160" y="22" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(12,14,22,.3)">MANAGED PIPELINE</text>
                            <g opacity=".6">
                                <line x1="108" y1="70" x2="210" y2="70" stroke="rgba(2,75,255,.12)" strokeWidth="1" strokeDasharray="4 3" />
                                <line x1="108" y1="102" x2="210" y2="102" stroke="rgba(2,75,255,.12)" strokeWidth="1" strokeDasharray="4 3" />
                                <line x1="108" y1="134" x2="210" y2="134" stroke="rgba(2,75,255,.12)" strokeWidth="1" strokeDasharray="4 3" />
                            </g>
                            <circle cy="70" r="4" fill="#024BFF" opacity=".7">
                                <animate attributeName="cx" values="108;210;210" dur="2.2s" repeatCount="indefinite" keyTimes="0;0.7;1" />
                                <animate attributeName="opacity" values="0;.8;0" dur="2.2s" repeatCount="indefinite" keyTimes="0;0.6;1" />
                            </circle>
                            <circle cy="102" r="4" fill="#024BFF" opacity=".7">
                                <animate attributeName="cx" values="108;210;210" dur="2.2s" begin=".5s" repeatCount="indefinite" keyTimes="0;0.7;1" />
                                <animate attributeName="opacity" values="0;.8;0" dur="2.2s" begin=".5s" repeatCount="indefinite" keyTimes="0;0.6;1" />
                            </circle>
                            <circle cy="134" r="4" fill="#024BFF" opacity=".7">
                                <animate attributeName="cx" values="108;210;210" dur="2.2s" begin="1s" repeatCount="indefinite" keyTimes="0;0.7;1" />
                                <animate attributeName="opacity" values="0;.8;0" dur="2.2s" begin="1s" repeatCount="indefinite" keyTimes="0;0.6;1" />
                            </circle>
                            <rect x="214" y="28" width="86" height="148" rx="7" fill="rgba(12,14,22,.03)" stroke="rgba(12,14,22,.1)" strokeWidth=".8" />
                            <text x="257" y="44" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(12,14,22,.4)">YOUR TEAM</text>
                            <g transform="translate(233, 56)">
                                <rect width="48" height="36" rx="4" fill="rgba(12,14,22,.04)" stroke="rgba(12,14,22,.1)" strokeWidth=".8" />
                                <rect x="4" y="4" width="12" height="10" rx="1" fill="rgba(2,75,255,.1)" />
                                <rect x="20" y="4" width="12" height="10" rx="1" fill="rgba(2,75,255,.08)" />
                                <rect x="36" y="4" width="8" height="10" rx="1" fill="rgba(2,75,255,.06)" />
                            </g>
                            <g transform="translate(233, 106)">
                                <rect width="48" height="26" rx="4" fill="rgba(16,185,129,.06)" stroke="rgba(16,185,129,.2)" strokeWidth=".8" />
                                <circle cx="12" cy="13" r="6" fill="rgba(16,185,129,.15)" stroke="#10b981" strokeWidth=".8" />
                                <polyline points="9,13 11,16 16,10" stroke="#10b981" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                <text x="26" y="11" fontFamily="DM Sans,sans-serif" fontSize="6" fontWeight="600" fill="#10b981">Hired</text>
                                <text x="26" y="20" fontFamily="DM Sans,sans-serif" fontSize="5.5" fill="rgba(12,14,22,.35)">Delivered</text>
                            </g>
                            <g transform="translate(233, 146)">
                                <rect width="48" height="24" rx="4" fill="rgba(2,75,255,.05)" stroke="rgba(2,75,255,.15)" strokeWidth=".8" />
                                <text x="24" y="10" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6" fontWeight="700" fill="#024BFF">RAPID</text>
                                <text x="24" y="19" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fill="rgba(12,14,22,.3)">Avg. 5 days</text>
                            </g>
                        </svg>
                    </div>
                    <span className="lp-engage-badge lp-dark">MOST POPULAR</span>
                    <div className="lp-engage-card-title">Rapid Recruiter</div>
                    <div className="lp-engage-card-desc">For growing teams that need a steady pipeline. Monthly subscription with priority support.</div>
                    <ul className="lp-engage-card-features">
                        <li>Unlimited job postings</li>
                        <li>Priority AI matching</li>
                        <li>Advanced analytics dashboard</li>
                        <li>Dedicated account team</li>
                    </ul>
                </div>

                {/* Card 3: On Demand / Enterprise */}
                <div className="lp-engage-card">
                    <div className="lp-engage-card-img">
                        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="lpOdGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                                </pattern>
                            </defs>
                            <rect width="320" height="200" fill="url(#lpOdGrid)" />
                            <rect x="20" y="24" width="126" height="152" rx="7" fill="#fff" stroke="rgba(2,75,255,.14)" strokeWidth="1" />
                            <rect x="20" y="24" width="126" height="22" rx="7" fill="rgba(2,75,255,.04)" />
                            <rect x="20" y="44" width="126" height="1.5" fill="rgba(2,75,255,.06)" />
                            <circle cx="33" cy="35" r="2.5" fill="rgba(2,75,255,.15)" />
                            <circle cx="42" cy="35" r="2.5" fill="rgba(2,75,255,.1)" />
                            <circle cx="51" cy="35" r="2.5" fill="rgba(2,75,255,.07)" />
                            <text x="83" y="37" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(2,75,255,.45)">Platform</text>
                            <g transform="translate(30, 52)">
                                <rect width="18" height="116" rx="3" fill="rgba(2,75,255,.04)" stroke="rgba(2,75,255,.08)" strokeWidth=".6" />
                                <circle cx="9" cy="10" r="3.5" fill="rgba(2,75,255,.2)" />
                                <rect width="83" height="28" x="23" rx="3" fill="rgba(2,75,255,.03)" stroke="rgba(2,75,255,.08)" strokeWidth=".6" />
                                <text x="53" y="12" fontFamily="DM Sans,sans-serif" fontSize="5.5" fill="rgba(12,14,22,.35)">Active Roles</text>
                                <text x="53" y="24" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="700" fill="#024BFF">48</text>
                                <g transform="translate(23, 34)">
                                    <rect width="83" height="42" rx="3" fill="rgba(2,75,255,.02)" stroke="rgba(2,75,255,.07)" strokeWidth=".6" />
                                    <rect x="6" y="28" width="8" height="8" rx="1" fill="rgba(2,75,255,.2)">
                                        <animate attributeName="height" values="2;8;2" dur="3s" repeatCount="indefinite" />
                                        <animate attributeName="y" values="34;28;34" dur="3s" repeatCount="indefinite" />
                                    </rect>
                                    <rect x="18" y="20" width="8" height="16" rx="1" fill="rgba(2,75,255,.3)">
                                        <animate attributeName="height" values="6;16;6" dur="3s" begin=".2s" repeatCount="indefinite" />
                                        <animate attributeName="y" values="30;20;30" dur="3s" begin=".2s" repeatCount="indefinite" />
                                    </rect>
                                    <rect x="30" y="16" width="8" height="20" rx="1" fill="rgba(2,75,255,.4)">
                                        <animate attributeName="height" values="10;20;10" dur="3s" begin=".4s" repeatCount="indefinite" />
                                        <animate attributeName="y" values="26;16;26" dur="3s" begin=".4s" repeatCount="indefinite" />
                                    </rect>
                                    <rect x="42" y="10" width="8" height="26" rx="1" fill="#024BFF" opacity=".7">
                                        <animate attributeName="height" values="14;26;14" dur="3s" begin=".6s" repeatCount="indefinite" />
                                        <animate attributeName="y" values="22;10;22" dur="3s" begin=".6s" repeatCount="indefinite" />
                                    </rect>
                                    <rect x="54" y="6" width="8" height="30" rx="1" fill="#024BFF">
                                        <animate attributeName="height" values="18;30;18" dur="3s" begin=".8s" repeatCount="indefinite" />
                                        <animate attributeName="y" values="18;6;18" dur="3s" begin=".8s" repeatCount="indefinite" />
                                    </rect>
                                </g>
                            </g>
                            <g transform="translate(146, 100)">
                                <line x1="0" y1="0" x2="28" y2="0" stroke="rgba(2,75,255,.2)" strokeWidth="1.5" strokeDasharray="4 3">
                                    <animate attributeName="strokeDashoffset" from="14" to="0" dur="1.2s" repeatCount="indefinite" />
                                </line>
                                <circle cx="14" cy="0" r="10" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1">
                                    <animate attributeName="strokeOpacity" values=".25;.6;.25" dur="2s" repeatCount="indefinite" />
                                </circle>
                                <line x1="9" y1="0" x2="19" y2="0" stroke="#024BFF" strokeWidth="1.5" strokeLinecap="round" />
                                <line x1="14" y1="-5" x2="14" y2="5" stroke="#024BFF" strokeWidth="1.5" strokeLinecap="round" />
                            </g>
                            <rect x="174" y="24" width="126" height="152" rx="7" fill="rgba(12,14,22,.02)" stroke="rgba(12,14,22,.1)" strokeWidth="1" />
                            <rect x="174" y="24" width="126" height="22" rx="7" fill="rgba(12,14,22,.04)" />
                            <text x="237" y="37" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="600" fill="rgba(12,14,22,.4)">Service</text>
                            <g transform="translate(184, 54)">
                                <text x="0" y="8" fontFamily="DM Sans,sans-serif" fontSize="6" fontWeight="600" fill="rgba(12,14,22,.35)">DEDICATED TEAM</text>
                                <rect x="0" y="48" width="106" height="24" rx="4" fill="rgba(2,75,255,.05)" stroke="rgba(2,75,255,.15)" strokeWidth=".8" />
                                <text x="53" y="59" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="700" fill="#024BFF">SLA Guaranteed</text>
                                <text x="53" y="67" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fill="rgba(12,14,22,.35)">White-glove delivery</text>
                                <rect x="0" y="78" width="106" height="24" rx="4" fill="rgba(12,14,22,.03)" stroke="rgba(12,14,22,.1)" strokeWidth=".8" />
                                <text x="53" y="89" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6.5" fontWeight="700" fill="rgba(12,14,22,.55)">Custom AI Model</text>
                                <text x="53" y="97" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fill="rgba(12,14,22,.3)">Trained on your data</text>
                                <g transform="translate(0, 110)">
                                    <rect width="50" height="16" rx="3" fill="rgba(2,75,255,.07)" stroke="rgba(2,75,255,.15)" strokeWidth=".5" />
                                    <text x="25" y="11" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6" fontWeight="600" fill="#024BFF">SOC 2</text>
                                </g>
                                <g transform="translate(56, 110)">
                                    <rect width="50" height="16" rx="3" fill="rgba(2,75,255,.07)" stroke="rgba(2,75,255,.15)" strokeWidth=".5" />
                                    <text x="25" y="11" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="6" fontWeight="600" fill="#024BFF">GDPR</text>
                                </g>
                                <g transform="translate(0, 132)">
                                    <rect width="106" height="16" rx="3" fill="rgba(16,185,129,.06)" stroke="rgba(16,185,129,.2)" strokeWidth=".5">
                                        <animate attributeName="opacity" values=".7;1;.7" dur="2.5s" repeatCount="indefinite" />
                                    </rect>
                                    <circle cx="12" cy="8" r="3" fill="rgba(16,185,129,.2)" stroke="#10b981" strokeWidth=".6" />
                                    <circle cx="12" cy="8" r="1.2" fill="#10b981">
                                        <animate attributeName="opacity" values=".4;1;.4" dur="1.5s" repeatCount="indefinite" />
                                    </circle>
                                    <text x="22" y="11" fontFamily="DM Sans,sans-serif" fontSize="6" fontWeight="600" fill="#10b981">ACTIVE</text>
                                    <text x="53" y="11" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="5.5" fill="rgba(12,14,22,.35)">99.9% uptime</text>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <span className="lp-engage-badge lp-blue">ENTERPRISE</span>
                    <div className="lp-engage-card-title">On Demand</div>
                    <div className="lp-engage-card-desc">Custom enterprise solutions with white-glove service, bespoke AI models, and SLA guarantees.</div>
                    <ul className="lp-engage-card-features">
                        <li>Custom AI model training</li>
                        <li>SLA-backed delivery</li>
                        <li>Full API integration</li>
                        <li>Compliance &amp; audit support</li>
                    </ul>
                </div>

            </div>
        </section>
    );
};

export default LandingEngagement;
