import React from 'react';
import '../styles/ProRecruiterHero.css';
import { FaArrowRight } from 'react-icons/fa';

const ProRecruiterHero = () => {
    return (
        <div className="pro-recruiter-hero-container">
            <div className="pro-recruiter-hero-left">
                <div className="hero-content">
                    <h1>Zep Pro Recruiter</h1>
                    <p>
                        An AI-powered TA suite for end-to-end recruiting AI-driven sourcing to
                        assessments, client-ready report cards, and performance insights that turn recruiters
                        into pro recruiters.
                    </p>
                    <button
                        className="book-demo-btn"
                        onClick={() => {
                            const element = document.getElementById('contact-form');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        Book a Demo <FaArrowRight className="arrow-icon" />
                    </button>
                </div>
            </div>
            <div className="pro-recruiter-hero-right">
                <img
                    src="/Rectangle 161123822(4).png"
                    alt="AI Recruitment"
                    className="hero-image"
                />
            </div>
        </div>
    );
};

export default ProRecruiterHero;
