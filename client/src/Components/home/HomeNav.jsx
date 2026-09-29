import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
    { to: '/zeprecruit', label: 'Zep Recruit' },
    { to: '/prorecruitor', label: 'Zep Pro Recruiter' },
    { to: '/zepJobs', label: 'Zep Jobs' },
    { to: '/zep-pro-recruiter-pricing', label: 'Pricing' },
    { to: '/about', label: 'About' },
];

const HomeNav = () => {
    const [open, setOpen] = useState(false);

    return (
        <header className="znav">
            <Link className="brand" to="/" aria-label="Zepul home" onClick={() => setOpen(false)}>
                <svg viewBox="-42 -56 84 112" width="20" height="26" aria-hidden="true">
                    <g fill="none" strokeWidth="7">
                        <path d="M-13.5,-13.3 L-37.5,-37 A46,46 0 0,1 37.5,-37 L0,0" stroke="currentColor" />
                        <path d="M0,0 L-37.5,37 A46,46 0 0,0 37.5,37 L13.5,13.3" stroke="#0A4DFF" />
                    </g>
                </svg>
                ZEPUL<sup>™</sup>
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
