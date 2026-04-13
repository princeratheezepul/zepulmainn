import React, { useState, useEffect, useRef } from 'react';
import LandingNav from '../Components/landing/LandingNav';
import '../styles/LandingPage.css';
import '../styles/Pricing.css';
import LandingBeyondCTA from '../Components/landing/LandingBeyondCTA';

// ── SVG helpers ──
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const CrossIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ArrowIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);
const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

// ── FAQ Item ──
const FaqItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`pr-faq-item${open ? ' open' : ''}`}>
            <button className="pr-faq-q" onClick={() => setOpen(!open)}>
                {question}
                <span className="pr-faq-icon"><PlusIcon /></span>
            </button>
            <div className="pr-faq-a">{answer}</div>
        </div>
    );
};

// ── Feature Row ──
const Feature = ({ text, bold }) => (
    <div className="pr-plan-feature">
        <div className="pr-plan-feature-icon"><CheckIcon /></div>
        <div className="pr-plan-feature-text">
            {bold ? <><strong>{bold}</strong>{text}</> : text}
        </div>
    </div>
);

const Pricing = () => {
    const [billing, setBilling] = useState('monthly');
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        const reveals = document.querySelectorAll('.pr-reveal');
        reveals.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const prices = {
        starter: { monthly: '299', annual: '239' },
        growth: { monthly: '799', annual: '639' },
        scale: { monthly: '1,799', annual: '1,439' },
    };

    const faqItems = [
        {
            question: 'Can I switch plans at any time?',
            answer: 'Yes — you can upgrade or downgrade at any time from your account dashboard. Upgrades take effect immediately with a prorated charge. Downgrades take effect at the start of your next billing cycle.',
        },
        {
            question: 'Is there a free trial available?',
            answer: 'Absolutely. All Starter and Growth plans come with a 14-day free trial — no credit card required. You\'ll have full access to the platform for the duration of your trial.',
        },
        {
            question: 'What happens if I exceed my active role limit?',
            answer: 'You\'ll receive a notification when you approach your limit. You can archive older roles to free up slots, or upgrade your plan to accommodate more active postings at any time.',
        },
        {
            question: 'Do you offer discounts for annual billing?',
            answer: 'Yes — switching to annual billing saves you 20% across all plans. The discount is applied automatically when you select annual billing during checkout or from your account settings.',
        },
        {
            question: 'What is ZepDB and how does it factor into pricing?',
            answer: 'ZepDB is Zepul\'s unified talent data layer — our proprietary database of screened, benchmarked candidates. Starter plans have read-only access, while Growth and above get full query and proactive sourcing capabilities from ZepDB.',
        },
        {
            question: 'How does Enterprise pricing work?',
            answer: 'Enterprise is tailored to your organisation — volume, geography, compliance needs, and integrations. Contact our sales team for a custom quote and we\'ll put together a proposal within 24 hours.',
        },
    ];

    return (
        <div className="pricing-page" ref={sectionRef}>
            <LandingNav />

            {/* ── HERO ── */}
            <section className="pr-hero">
                <div className="pr-hero-badge">
                    <span className="pr-badge-dot"></span>
                    Simple, Transparent Pricing
                </div>
                <h1>Plans built for every<br /><span className="blue">stage of growth</span></h1>
                <p className="pr-hero-sub">
                    Whether you're hiring one role or scaling a team — pick the model that fits. No hidden fees, no long-term lock-in.
                </p>
                <div className="pr-hero-toggle">
                    <button
                        className={`pr-toggle-btn${billing === 'monthly' ? ' active' : ''}`}
                        onClick={() => setBilling('monthly')}
                    >Monthly</button>
                    <button
                        className={`pr-toggle-btn${billing === 'annual' ? ' active' : ''}`}
                        onClick={() => setBilling('annual')}
                    >Annual <span className="pr-toggle-save">Save 20%</span></button>
                </div>
            </section>

            {/* ── NEW HERO & PLANS ── */}
            <section className="pr-new-hero pr-reveal">
                <div className="pr-new-hero-left">
                    <div className="pr-new-hero-badge">FOR EMPLOYERS</div>
                    <h1 className="pr-new-hero-title">
                        AI hiring, your way<br />
                        choose your model,<br />
                        choose your price
                    </h1>
                </div>

                <div className="pr-new-hero-right">
                    {/* PRODUCT CARD */}
                    <div className="pr-new-card">
                        <div className="pr-new-card-badge">PRODUCT</div>
                        <h2 className="pr-new-card-title">Zep Pro Recruiter</h2>
                        <p className="pr-new-card-desc">For high-growth orgs running full-cycle recruitment with AI at the core.</p>

                        <div className="pr-new-card-price-wrap">
                            <span className="pr-new-card-currency">$</span>
                            <span className="pr-new-card-price">200</span>
                            <span className="pr-new-card-mo">/mo</span>
                        </div>
                        <p className="pr-new-card-billed">Billed Annually.</p>

                        <div className="pr-new-card-features">
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                100% Automated workflow
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Conversational AI agent for JD and Job Creation
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Job board integration - AI Sourcing
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                CV Strength - Read , Rank, Match
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Customised Dynamic Coding test
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Automated Decision Ready Scorecard
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Customised AI Interview
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Intelligent Performance Dashboards
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                24*7 Chat Support
                            </div>
                        </div>

                        <a href="#" className="pr-new-btn outlined">
                            Get Started <ArrowIcon />
                        </a>
                    </div>

                    {/* SERVICES CARD */}
                    <div className="pr-new-card">
                        <div className="pr-new-card-badge">SERVICES</div>
                        <h2 className="pr-new-card-title">Zep Recruit</h2>
                        <p className="pr-new-card-desc">Custom Fullstack AI Hiring services for companies of every size</p>

                        <div className="pr-new-card-price-wrap custom">
                            <span className="pr-new-card-price">Custom</span>
                        </div>
                        <p className="pr-new-card-billed">Tailored to your organisation size &amp; needs<br />100% AI-powered hiring, outsmarting traditional agencies</p>

                        <div className="pr-new-card-features">
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Conversational AI agent for JD and Job Creation
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Multiple engagement Model support - DH, C2H,C, RaaS
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Lowest TAT & Highest Quality Compared to agencies / legacy models
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Balanced Cost & Commitment
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Dedicated Account Manager
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                24/7 priority support + CSM
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Comprehensive Decision Ready Reportcards that replace CVs
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                End to End lifecycle support from Requisition to Onboarding
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Scale recruiting capacity instantly, up or down
                            </div>
                        </div>

                        <a href="#" className="pr-new-btn solid">
                            Talk to Sales <ArrowIcon />
                        </a>
                    </div>
                </div>
            </section>

            {/* ── JOBSEEKER HERO & PLANS ── */}
            <section className="pr-new-hero pr-jobseeker-section pr-reveal">
                <div className="pr-new-hero-left">
                    <div className="pr-new-hero-badge">FOR JOBSEEKERS &amp; RECRUITERS</div>
                    <h1 className="pr-new-hero-title">
                        AI agents that<br />
                        accelerate your<br />
                        growth at no cost
                    </h1>
                </div>

                <div className="pr-new-hero-right">
                    {/* ZEP JOBS CARD */}
                    <div className="pr-new-card pr-js-card">
                        <div className="pr-new-card-badge">AGENTIC JOB PORTAL</div>
                        <h2 className="pr-new-card-title">Zep Jobs</h2>
                        <p className="pr-new-card-desc">AI agentic job portal where Talent Meets Opportunity</p>

                        <div className="pr-new-card-price-wrap">
                            <span className="pr-new-card-currency">$</span>
                            <span className="pr-new-card-price">0</span>
                            <span className="pr-new-card-mo">/mo</span>
                        </div>
                        <p className="pr-new-card-billed">Lifetime Free</p>

                        <div className="pr-new-card-features">
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Agent to understand your aspirations
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                AI Based Job Matching
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Access to Global Opportunities
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Free AI based Upskill and Interview Prep Help
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Direct Connection to Decision makers
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                ZepDB access (read only)
                            </div>
                        </div>

                        <a href="#" className="pr-new-btn ghost-btn">
                            Talk to Our AI Agent <ArrowIcon />
                        </a>
                    </div>

                    {/* ZEP ON DEMAND CARD */}
                    <div className="pr-new-card pr-js-card">
                        <div className="pr-new-card-badge">RECRUITMENT PARTNER</div>
                        <h2 className="pr-new-card-title">Zep On Demand</h2>
                        <p className="pr-new-card-desc">Opportunity for anyone to become Global Recruiter and access our AI tools and Business</p>

                        <div className="pr-new-card-price-wrap">
                            <span className="pr-new-card-currency">$</span>
                            <span className="pr-new-card-price">0</span>
                            <span className="pr-new-card-mo">/mo</span>
                        </div>
                        <p className="pr-new-card-billed">Conditional Free</p>

                        <div className="pr-new-card-features">
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Access to fullstack AI hiring platform
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Access to Global Business
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Access to Global job Market Intelligence
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Access to Market &amp; Candidate Specific Benchmarking
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Access to Intelligent Dashboards
                            </div>
                            <div className="pr-new-feature">
                                <span className="pr-new-check blue"><CheckIcon /></span>
                                Opportunity to Outsmart agencies
                            </div>
                        </div>

                        <a href="#" className="pr-new-btn ghost-btn">
                            Start Free Trial <ArrowIcon />
                        </a>
                    </div>
                </div>
            </section>

            {/* ── COMPARE TABLE ── */}
            {/* <section className="pr-compare">
                <div className="pr-compare-header pr-reveal">
                    <div>
                        <h2>Compare all<br /><span className="blue">plan features</span></h2>
                    </div>
                    <p>A full breakdown so you can choose the plan that truly fits your hiring motion.</p>
                </div>

                <div className="pr-reveal">
                    <table className="pr-compare-table">
                        <thead>
                            <tr>
                                <th style={{ width: '34%' }}>Feature</th>
                                <th>Starter</th>
                                <th>Growth</th>
                                <th className="popular-col">Scale</th>
                                <th>Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="section-row"><td colSpan={5}>Sourcing &amp; Screening</td></tr>
                            <tr>
                                <td>Active job postings</td><td>Up to 3</td><td>Up to 10</td>
                                <td className="popular-col">Unlimited</td><td>Unlimited</td>
                            </tr>
                            <tr>
                                <td>AI multi-channel sourcing</td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>
                            <tr>
                                <td>CV read, rank &amp; match (AI)</td><td>Basic</td><td>Full</td>
                                <td className="popular-col">Full + Predictive</td><td>Full + Predictive</td>
                            </tr>
                            <tr>
                                <td>AI coding assessments</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>
                            <tr>
                                <td>AI video interviews</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>

                            <tr className="section-row"><td colSpan={5}>Reports &amp; Intelligence</td></tr>
                            <tr>
                                <td>Decision-Ready Report Cards</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>
                            <tr>
                                <td>Talent &amp; market insights</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>
                            <tr>
                                <td>Candidate benchmarking</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>

                            <tr className="section-row"><td colSpan={5}>Management &amp; Support</td></tr>
                            <tr>
                                <td>Recruiter seats</td><td>1</td><td>5</td>
                                <td className="popular-col">Unlimited</td><td>Unlimited</td>
                            </tr>
                            <tr>
                                <td>Dedicated account manager</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-yes"><CheckIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>
                            <tr>
                                <td>API access &amp; ATS integrations</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>
                            <tr>
                                <td>Custom SLAs &amp; compliance</td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-no"><CrossIcon /></span></td>
                                <td className="popular-col"><span className="pr-check-no"><CrossIcon /></span></td>
                                <td><span className="pr-check-yes"><CheckIcon /></span></td>
                            </tr>
                            <tr>
                                <td>Support</td>
                                <td>Email &amp; Chat</td><td>Priority Email</td>
                                <td className="popular-col">Dedicated CSM</td><td>24/7 Priority + CSM</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section> */}

            {/* ── FAQ ── */}
            <section className="pr-faq">
                <div className="pr-faq-inner">
                    <div className="pr-faq-header pr-reveal">
                        <h2>Frequently asked<br /><span className="blue">questions</span></h2>
                        <p>Everything you need to know about Zepul pricing and plans.</p>
                    </div>
                    {faqItems.map((item, i) => (
                        <div className="pr-reveal" key={i}>
                            <FaqItem question={item.question} answer={item.answer} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── BEYOND CTA ── */}
            <section className="pr-beyond">
                <div className="pr-beyond-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Ready to hire smarter?
                </div>
                <h2 className="pr-reveal">Start hiring with<br /><span className="blue">Zepul today.</span></h2>
                <p className="pr-beyond-sub pr-reveal">No setup fees. No long-term contracts. Just faster, smarter hiring — from day one.</p>
                <div className="pr-beyond-actions pr-reveal">
                    <a href="#" className="pr-beyond-btn primary">
                        Start Free Trial <ArrowIcon />
                    </a>
                    <a href="#" className="pr-beyond-btn ghost">Talk to Sales</a>
                </div>
                <div className="pr-beyond-logos pr-reveal">
                    <span className="pr-beyond-logo-label">Trusted by</span>
                    <span className="pr-beyond-logo-pill">Startups</span>
                    <span className="pr-beyond-logo-pill">Scale-ups</span>
                    <span className="pr-beyond-logo-pill">Enterprise</span>
                    <span className="pr-beyond-logo-pill">Global Teams</span>
                </div>
            </section>
            <LandingBeyondCTA />


        </div>
    );
};

export default Pricing;
