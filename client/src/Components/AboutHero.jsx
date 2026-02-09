import React from 'react';
import '../styles/AboutHero.css';

const AboutHero = () => {
    return (
        <div className="about-hero-container">
            <div className="about-hero-header">
                <h1>About</h1>
            </div>
            <div className="about-hero-content">
                <div className="about-image-container">
                    <img src="/skyline.png" alt="City Skyline" className="about-hero-image" />
                </div>
                <div className="about-text-content">
                    <p>
                        Hiring has become one of the most critical and complex challenges for organizations today. Fragmented systems, slow processes, and misaligned stakeholders continue to hold businesses back. We built this HRTech marketplace to fundamentally change how talent is discovered and hired.
                    </p>
                    <p>
                        Our platform unifies the entire talent ecosystem employers, recruiters, talent partners, and candidates into a single, intelligent marketplace. Powered by a robust AI engine, we enable faster hiring, higher-quality matches, and data-driven decisions with precision and scale.
                    </p>
                    <p>
                        By bringing together technology, intelligence, and collaboration, we are redefining talent acquisition transforming it into a streamlined, transparent, and future-ready experience for modern organizations.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutHero;
