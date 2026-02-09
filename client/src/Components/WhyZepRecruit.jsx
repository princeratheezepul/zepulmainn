import React from 'react';
import '../styles/WhyZepRecruit.css';

const WhyZepRecruit = () => {
    return (
        <div className="why-zep-recruit-container">
            <div className="why-zep-recruit-left">
                <h2>Why Zep<br /> Recuit</h2>
                <p>
                    Zep Recruit automates the tedious stages of sourcing and screening,
                    allowing your team to focus on what matters most: the people.
                </p>
            </div>
            <div className="why-zep-recruit-right">
                <div className="stat-card">
                    <span>Offer Dropouts</span>
                    <span className="stat-value">&lt;= 15%</span>
                </div>
                <div className="stat-card">
                    <span>Database that instantly sources top talent</span>
                    <span className="stat-value">ZepDB</span>
                </div>
                <div className="stat-card">
                    <span>Joining no-shows</span>
                    <span className="stat-value">&lt;= 5%</span>
                </div>
                <div className="stat-card">
                    <span>Pre Vetted decision ready talent data ,including coding test</span>
                    <span className="stat-value">100%</span>
                </div>
                <div className="stat-card">
                    <span>Hires Without lag</span>
                    <span className="stat-value">5-5K</span>
                </div>
                <div className="stat-card">
                    <span>Higher shortlist accuracy</span>
                    <span className="stat-value">2x</span>
                </div>
                <div className="stat-card">
                    <span>Lower cost-per-hire</span>
                    <span className="stat-value">30-40%</span>
                </div>
                <div className="stat-card">
                    <span>Active Recruitment Partners</span>
                    <span className="stat-value">150+</span>
                </div>
            </div>
        </div>
    );
};

export default WhyZepRecruit;
