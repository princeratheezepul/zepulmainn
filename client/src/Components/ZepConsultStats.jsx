import React from 'react';
import '../styles/ZepConsultStats.css';

const ZepConsultStats = () => {
    const stats = [
        {
            metric: '100+',
            description: 'Delivery-ready engineers across core & emerging tech'
        },
        {
            metric: '<15',
            description: 'From requirement to billable onboarding'
        },
        {
            metric: '100%',
            description: 'Consultants assessed on skills, experience & delivery readiness'
        },
        {
            metric: '100%',
            description: 'Pre Vetted decision ready talent data ,including coding test'
        },
        {
            metric: '1-50+',
            description: 'Consultants scalable per project without renegotiation'
        },
        {
            metric: '<5%',
            description: 'Unplanned attrition during active engagements'
        }
    ];

    return (
        <div className="zep-consult-stats-container">
            <div className="stats-left">
                <h2>Why Zep<br />Consult</h2>
                <p className="stats-description">
                    Technology Companies • Fintech • HealthTech<br />
                    Enterprise IT From fast-growing startups to<br />
                    large organizations modernizing legacy<br />
                    systems.
                </p>
            </div>
            <div className="stats-right">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-metric">{stat.metric}</div>
                            <div className="stat-description">{stat.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ZepConsultStats;
