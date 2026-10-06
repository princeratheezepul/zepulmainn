import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
    { to: '/zeus', label: 'Zeus - AI Hiring Partner' },
    { to: '/thea', label: 'Thea - AI Career Partner' },
    { to: '/zeprecruit', label: 'Zep Recruit' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About' },
];

const HomeNav = () => {
    const [open, setOpen] = useState(false);
    const navRef = useRef(null);

    // The nav is pinned to the viewport, so it needs a surface of its own as
    // soon as the hero starts sliding underneath it. Toggled via a class
    // rather than state so a scroll never re-renders the tree.
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                nav.classList.toggle('scrolled', window.scrollY > 20);
                ticking = false;
            });
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className="znav" ref={navRef}>
            <Link className="brand" to="/" aria-label="Zepul home" onClick={() => setOpen(false)}>
                <img src="/assets/logo.png" alt="Zepul" />
            </Link>

            <ul className={`links${open ? ' open' : ''}`} id="z1-links">
                {LINKS.map(({ to, label }) => (
                    <li key={to}>
                        <Link to={to} onClick={() => setOpen(false)}>{label}</Link>
                    </li>
                ))}
            </ul>

            <button
                className="menu"
                type="button"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="z1-links"
                onClick={() => setOpen(o => !o)}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
            </button>

            <Link className="cta" to="/login">
                Start Hiring <span aria-hidden="true">→</span>
            </Link>
        </header>
    );
};

export default HomeNav;
