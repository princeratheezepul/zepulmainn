import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LandingNav = () => {
    const navRef = useRef(null);
    const location = useLocation();
    const isAbout = location.pathname === '/about';

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        let lastY = 0;
        let ticking = false;
        const THRESHOLD = 8;

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                if (y > 20) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                if (y > lastY + THRESHOLD && y > 120) {
                    nav.classList.add('hidden');
                } else if (y < lastY - THRESHOLD) {
                    nav.classList.remove('hidden');
                }
                lastY = y;
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`lp-nav${isAbout ? ' about-theme' : ''}`} ref={navRef}>
            <div className="lp-logo">
                <Link to="/">
                    <img src="/assets/logo.png" alt="Zepul" />
                </Link>
            </div>

            <div className="lp-nav-links">
                <Link to="/zeprecruit" className="lp-nl">Zep Recruit</Link>
                <Link to="/prorecruitor" className="lp-nl">Zep Pro Recruiter</Link>
                <Link to="/zepJobs" className="lp-nl">Zep Jobs</Link>
                <Link to="/pricing" className="lp-nl">Pricing</Link>
                <Link to="/about" className="lp-nl">About</Link>
            </div>

            <div className="lp-nav-right">
                <button className="lp-nav-btn">
                    Start Hiring
                    <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 5.5h7M6 2.5l3 3-3 3" />
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default LandingNav;
