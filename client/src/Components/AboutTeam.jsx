import React from 'react';
import '../styles/AboutTeam.css';

const AboutTeam = () => {
    const teamMembers = [
        {
            name: 'Srikanth',
            role: 'Founder & CEO',
            image: '/srikanth.png'
        },
        {
            name: 'Tarun',
            role: 'Co-Founder & COO',
            image: '/tarun.png'
        },
        {
            name: 'Reena',
            role: 'Head of Operations',
            image: '/reena.png'
        }
    ];

    return (
        <div className="about-team-container">
            <h2 className="team-title">Our Leadership Team</h2>
            <div className="team-grid">
                {teamMembers.map((member, index) => (
                    <div key={index} className="team-card">
                        <div className="team-image-container">
                            <img src={member.image} alt={member.name} className="team-image" />
                        </div>
                        <div className="team-info">
                            <h3 className="team-name">{member.name}</h3>
                            <p className="team-role">{member.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AboutTeam;
