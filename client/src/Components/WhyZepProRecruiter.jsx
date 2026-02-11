import React from 'react';
import '../styles/WhyZepProRecruiter.css';
import { FaArrowRight } from 'react-icons/fa';

const WhyZepProRecruiter = () => {
    return (
        <div className="why-zep-pro-recruiter-container">
            <div className="why-zep-pro-recruiter-left">
                <h2>Why Zep Pro<br /> Recruiter</h2>
                <div className="description-container">
                    <p>
                        Maximize your hiring precision while minimizing manual effort through AI-
                        driven resume screening and automated skill validation that results in a single,
                        clear scorecard for every candidate.
                    </p>
                </div>
            </div>
            <div className="why-zep-pro-recruiter-right">
                <div className="feature-card">
                    <span>Resumes screened per role using AI CV strength scoring</span>
                    <span className="metric">100+</span>
                </div>
                <div className="feature-card">
                    <span>Reduction in manual screening effort</span>
                    <span className="metric">+60%</span>
                </div>
                <div className="feature-card">
                    <span>Automated role-based technical skill assessments</span>
                    <span className="metric arrow"><FaArrowRight /></span>
                </div>
                <div className="feature-card">
                    <span>AI-assisted interviews conducted at scale</span>
                    <span className="metric">AI</span>
                </div>
                <div className="feature-card">
                    <span>Unified scorecards generated instantly</span>
                    <span className="metric arrow"><FaArrowRight /></span>
                </div>
                <div className="feature-card">
                    <span>Unified scorecards generated instantly</span>
                    <span className="metric arrow"><FaArrowRight /></span>
                </div>
            </div>
        </div>
    );
};

export default WhyZepProRecruiter;
