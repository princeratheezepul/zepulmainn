import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const LandingNav = () => {
    const navRef = useRef(null);
    const location = useLocation();
    const isAbout = location.pathname === '/about';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <>
            <nav className={`lp-nav${isAbout ? ' about-theme' : ''}`} ref={navRef}>
                <div className="lp-logo">
                    <Link to="/" onClick={closeSidebar}>
                        <img src="/assets/logo.png" alt="Zepul" />
                    </Link>
                </div>

                <div className="lp-nav-links desktop-only">
                    <Link to="/zeprecruit" className="lp-nl">Zep Recruit</Link>
                    <Link to="/prorecruitor" className="lp-nl">Zep Pro Recruiter</Link>
                    <Link to="/zepJobs" className="lp-nl">Zep Jobs</Link>
                    <Link to="/pricing" className="lp-nl">Pricing</Link>
                    <Link to="/about" className="lp-nl">About</Link>
                </div>

                <div className="lp-nav-right">
                    <button className="lp-nav-btn desktop-only" onClick={() => {
                        const cta = document.getElementById('beyond-cta');
                        if (cta) cta.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        Start Hiring
                        <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 5.5h7M6 2.5l3 3-3 3" />
                        </svg>
                    </button>

                    <button className="lp-mobile-toggle" onClick={toggleSidebar}>
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            <div className={`lp-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />

            {/* Mobile Sidebar */}
            <div className={`lp-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="lp-sidebar-content">
                    <div className="lp-sidebar-links">
                        <Link to="/zeprecruit" className="lp-sidebar-link" onClick={closeSidebar}>Zep Recruit</Link>
                        <Link to="/prorecruitor" className="lp-sidebar-link" onClick={closeSidebar}>Zep Pro Recruiter</Link>
                        <Link to="/zepJobs" className="lp-sidebar-link" onClick={closeSidebar}>Zep Jobs</Link>
                        <Link to="/pricing" className="lp-sidebar-link" onClick={closeSidebar}>Pricing</Link>
                        <Link to="/about" className="lp-sidebar-link" onClick={closeSidebar}>About</Link>
                    </div>

                    <div className="lp-sidebar-bottom">
                        <button className="lp-sidebar-btn" onClick={() => {
                            closeSidebar();
                            setTimeout(() => {
                                const cta = document.getElementById('beyond-cta');
                                if (cta) cta.scrollIntoView({ behavior: 'smooth' });
                            }, 300);
                        }}>
                            Start Hiring
                            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 5.5h7M6 2.5l3 3-3 3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingNav;
