import React from 'react';
import '../styles/ZepConsultHero.css';
import { FaArrowRight } from 'react-icons/fa';

const ZepConsultHero = () => {
    return (
        <div className="zep-consult-hero-container">
            <div className="zep-consult-hero-left">
                <h1>Zep Consult</h1>
                <p className="subtitle">Global, On-Demand IT Consulting for Scalable Enterprises</p>
                <p className="description">
                    Zep Consult is the technology consulting vertical of Zepul, delivering
                    high-impact IT strategy, engineering, and transformation services
                    through a distributed network of senior consultants across the globe. We
                    help organizations architect, secure, and scale their technology with
                    precision.
                </p>
                <div className="bottom-text">
                    <p>
                        Zep Jobs gives candidates access to
                        quality opportunities through
                        transparent, skill-based evaluation —
                        free of cost.
                    </p>
                </div>
                <button className="book-demo-btn">
                    Book a Demo <FaArrowRight />
                </button>
            </div>
            <div className="zep-consult-hero-right">
                <img
                    src="/Rectangle 161123822(5).png"
                    alt="Zep Consult Technology"
                    className="hero-image"
                />
            </div>
        </div>
    );
};

export default ZepConsultHero;
