import React, { useEffect, useRef } from 'react';

const LandingNav = () => {
    const navRef = useRef(null);

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
        <nav className="lp-nav" ref={navRef}>
            <div className="lp-logo">
                <img src="/assets/zepul-logo.png" alt="Zepul" onError={e => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span style="font-family:Lora,serif;font-size:20px;font-weight:700;color:#0C0E16;letter-spacing:-.02em;">Zepul</span>'); }} />
            </div>

            <div className="lp-nav-links">
                <button className="lp-nl">Zep Recruit</button>
                <button className="lp-nl">Zep Pro Recruiter</button>
                <button className="lp-nl">Zep Jobs</button>
                <button className="lp-nl">Zep Consult</button>
                <button className="lp-nl">Pricing</button>
                <button className="lp-nl">About</button>
            </div>

            <div className="lp-nav-right">
                <button className="lp-nav-btn">
                    Book a Demo
                    <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 5.5h7M6 2.5l3 3-3 3" />
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default LandingNav;
