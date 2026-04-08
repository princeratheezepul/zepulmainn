import React, { useState, useEffect, useRef } from 'react';
import LandingNav from '../Components/landing/LandingNav';
import '../styles/LandingPage.css';
import '../styles/Pricing.css';

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

            {/* ── PLANS ── */}
            <section className="pr-plans">
                <div className="pr-plans-grid pr-reveal">

                    {/* STARTER */}
                    <div className="pr-plan-card">
                        <div className="pr-plan-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                            Starter
                        </div>
                        <div className="pr-plan-name">Starter</div>
                        <div className="pr-plan-tagline">Perfect for startups and lean teams making their first strategic hires.</div>
                        <div className="pr-plan-price">
                            <span className="pr-price-currency">$</span>
                            <span className="pr-price-amount">{prices.starter[billing]}</span>
                            <span className="pr-price-period">/mo</span>
                        </div>
                        <div className="pr-plan-price-note">Billed monthly · Up to 3 active roles</div>
                        <hr className="pr-plan-divider" />
                        <div className="pr-plan-features">
                            <Feature bold="3 active job postings" text=" at a time" />
                            <Feature text="AI-powered candidate sourcing" />
                            <Feature text="Basic CV screening & ranking" />
                            <Feature bold="1 recruiter seat" text=" included" />
                            <Feature text="Email & chat support" />
                            <Feature text="ZepDB access (read only)" />
                        </div>
                        <a href="#" className="pr-plan-cta">Start Free Trial <ArrowIcon /></a>
                    </div>

                    {/* GROWTH */}
                    <div className="pr-plan-card">
                        <div className="pr-plan-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            Growth
                        </div>
                        <div className="pr-plan-name">Growth</div>
                        <div className="pr-plan-tagline">For scaling companies hiring across multiple functions simultaneously.</div>
                        <div className="pr-plan-price">
                            <span className="pr-price-currency">$</span>
                            <span className="pr-price-amount">{prices.growth[billing]}</span>
                            <span className="pr-price-period">/mo</span>
                        </div>
                        <div className="pr-plan-price-note">Billed monthly · Up to 10 active roles</div>
                        <hr className="pr-plan-divider" />
                        <div className="pr-plan-features">
                            <Feature bold="10 active job postings" text=" at a time" />
                            <Feature text="Full AI sourcing + predictive matching" />
                            <Feature text="AI coding tests & automated interviews" />
                            <Feature bold="5 recruiter seats" text=" included" />
                            <Feature text="Decision-Ready Report Cards" />
                            <Feature text="Talent & market insights dashboard" />
                        </div>
                        <a href="#" className="pr-plan-cta">Start Free Trial <ArrowIcon /></a>
                    </div>

                    {/* SCALE — POPULAR */}
                    <div className="pr-plan-card popular">
                        <div className="pr-popular-bar"></div>
                        <div className="pr-plan-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            Most Popular
                        </div>
                        <div className="pr-plan-name">Scale</div>
                        <div className="pr-plan-tagline">For high-growth orgs running full-cycle recruitment with AI at the core.</div>
                        <div className="pr-plan-price">
                            <span className="pr-price-currency">$</span>
                            <span className="pr-price-amount">{prices.scale[billing]}</span>
                            <span className="pr-price-period">/mo</span>
                        </div>
                        <div className="pr-plan-price-note">Billed monthly · Unlimited active roles</div>
                        <hr className="pr-plan-divider" />
                        <div className="pr-plan-features">
                            <Feature bold="Unlimited" text=" active job postings" />
                            <Feature text="Full Zep Pro Recruiter suite" />
                            <Feature text="Human validation + expert review layer" />
                            <Feature bold="Unlimited recruiter seats" text="" />
                            <Feature text="Dedicated account manager" />
                            <Feature text="Benchmarking + negotiation experts" />
                        </div>
                        <a href="#" className="pr-plan-cta filled">Get Started <ArrowIcon /></a>
                    </div>

                    {/* ENTERPRISE */}
                    <div className="pr-plan-card">
                        <div className="pr-plan-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                            Enterprise
                        </div>
                        <div className="pr-plan-name">Enterprise</div>
                        <div className="pr-plan-tagline">Custom infrastructure, SLAs, and compliance for large-scale global hiring.</div>
                        <div className="pr-plan-price" style={{ marginBottom: 6 }}>
                            <span className="pr-price-custom">Custom</span>
                        </div>
                        <div className="pr-plan-price-note">Tailored to your organisation size &amp; needs</div>
                        <hr className="pr-plan-divider" />
                        <div className="pr-plan-features">
                            <Feature text="Everything in Scale, plus:" />
                            <Feature text="Custom SLAs & compliance (SOC2, GDPR)" />
                            <Feature text="Dedicated on-site recruiter team" />
                            <Feature text="API access & ATS integrations" />
                            <Feature text="White-label reporting & branded portals" />
                            <Feature text="24/7 priority support + CSM" />
                        </div>
                        <a href="#" className="pr-plan-cta">Talk to Sales <ArrowIcon /></a>
                    </div>

                </div>
            </section>

            {/* ── COMPARE TABLE ── */}
            <section className="pr-compare">
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
            </section>

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

            {/* ── FOOTER ── */}
            <footer className="pr-footer">
                <div className="pr-footer-grid">
                    <div>
                        <a className="pr-footer-brand-logo" href="/">
                            <img src="/assets/logo.png" alt="Zepul" />
                        </a>
                        <p className="pr-footer-brand-desc">AI-powered recruitment — from sourcing to onboarding, built for the world's best teams.</p>
                    </div>
                    <div>
                        <div className="pr-footer-col-title">Product</div>
                        <div className="pr-footer-col-links">
                            <a href="/zeprecruit">Zep Recruit</a>
                            <a href="/prorecruitor">Zep Pro Recruiter</a>
                            <a href="/zepConsult">Zep Consult</a>
                            <a href="/zepJobs">Zep Jobs</a>
                            <a href="/pricing">Pricing</a>
                        </div>
                    </div>
                    <div>
                        <div className="pr-footer-col-title">Company</div>
                        <div className="pr-footer-col-links">
                            <a href="/about">About</a>
                            <a href="/careers">Careers</a>
                            <a href="#">Blog</a>
                            <a href="#">Press</a>
                        </div>
                    </div>
                    <div>
                        <div className="pr-footer-col-title">Legal</div>
                        <div className="pr-footer-col-links">
                            <a href="/privacy">Privacy Policy</a>
                            <a href="/terms">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                            <a href="#">GDPR</a>
                        </div>
                    </div>
                </div>
                <div className="pr-footer-bottom">
                    <span className="pr-footer-copy">© 2026 Zepul. All rights reserved.</span>
                    <div className="pr-footer-social">
                        <a href="#" aria-label="LinkedIn">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                            </svg>
                        </a>
                        <a href="#" aria-label="Twitter">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
